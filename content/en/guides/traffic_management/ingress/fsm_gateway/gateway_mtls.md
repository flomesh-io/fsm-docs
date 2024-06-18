---
title: "Gateway mTLS"
description: "Enabling Mutual TLS at the gateway enhances security by requiring mutual authentication, making it ideal for secure environments and sensitive data handling."
type: docs
weight: 38
draft: false
---

Enabling mTLS (Mutual TLS Verification) at the gateway is an advanced security measure that requires both the server to prove its identity to the client and vice versa. This mutual authentication significantly enhances communication security, ensuring only clients with valid certificates can establish a connection with the server. mTLS is particularly suitable for highly secure scenarios, such as financial transactions, corporate networks, or applications involving sensitive data. It provides a robust authentication mechanism, effectively reducing unauthorized access and helping organizations comply with strict data protection regulations.

By implementing mTLS, the gateway not only secures data transmission but also provides a more reliable and secure interaction environment between clients and servers.

## Prerequisites

- Kubernetes cluster
- kubectl tool
- FSM Gateway installed via [guide doc](/guides/traffic_management/ingress/fsm_gateway/installation).

## Demonstration

### Creating Gateway TLS Certificate

```shell
openssl genrsa 2048 > ca-key.pem

openssl req -new -x509 -nodes -days 365000 \
   -key ca-key.pem \
   -out ca-cert.pem \
   -subj '/CN=flomesh.io'

openssl genrsa -out server-key.pem 2048
openssl req -new -key server-key.pem -out server.csr -subj '/CN=foo.example.com'
openssl x509 -req -in server.csr -CA ca-cert.pem -CAkey ca-key.pem -CAcreateserial -out server-cert.pem -days 365
```

Create a Secret `server-cert` using the CA certificate, server certificate, and key. When the gateway only enables TLS, only the server certificate and key are used.

```shell
kubectl create namespace httpbin
#TLS cert secret
kubectl create secret generic -n httpbin simple-gateway-cert \
  --from-file=tls.crt=./server-cert.pem \
  --from-file=tls.key=./server-key.pem \
  --from-file=ca.crt=ca-cert.pem
```

### Deploying Sample Application

Deploy the httpbin service and create a TLS gateway and route for it.

```shell
kubectl apply -n httpbin -f https://raw.githubusercontent.com/flomesh-io/fsm-docs/{{< param fsm_branch >}}/manifests/gateway/tls-termination.yaml
```

Access the httpbin service through the gateway using the CA certificate created earlier, successfully accessing it.

```
curl --cacert ca-cert.pem https://foo.example.com/headers --connect-to foo.example.com:443:$GATEWAY_IP:8000
{
  "headers": {
    "Accept": "*/*",
    "Host": "foo.example.com",
    "User-Agent": "curl/8.1.2"
  }
}
```

## Gateway mTLS Verification

### Enabling mTLS

Now, following the [GatewayTLSPolicy](/api_reference/policyattachment/v1alpha1/#gateway.flomesh.io/v1alpha1.GatewayTLSPolicy) document, enable mTLS for the gateway.

```shell
kubectl apply -n httpbin -f - <<EOF
apiVersion: gateway.flomesh.io/v1alpha1
kind: GatewayTLSPolicy
metadata:
  name: gateway-tls-policy-sample
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: Gateway
    name: simple-fsm-gateway
    namespace: httpbin
  ports:
  - port: 8000
    config:
      mTLS: true
EOF
```

At this point, if we still use the original method of access, the access will be denied. The gateway has now started mutual mTLS authentication and will verify the client's certificate.

```shell
curl --cacert ca-cert.pem https://foo.example.com/headers --connect-to foo.example.com:443:$GATEWAY_IP:8000

curl: (52) Empty reply from server
```

### Issuing Client Certificate

Using the CA certificate created earlier, issue a certificate for the client.

```shell
openssl genrsa -out client-key.pem 2048

openssl req -new -key client-key.pem -out client.csr -subj '/CN=example.com'
openssl x509 -req -in client.csr -CA ca-cert.pem -CAkey ca-key.pem -CAcreateserial -out client-cert.pem -days 365
```

Now, when making a request, in addition to specifying the CA certificate, also specify the client's certificate and key to successfully pass the gateway's verification and access.

```shell
curl --cacert ca-cert.pem --cert client-cert.pem --key client-key.pem https://foo.example.com/headers --connect-to foo.example.com:443:$GATEWAY_IP:8000
{
  "headers": {
    "Accept": "*/*",
    "Host": "foo.example.com",
    "User-Agent": "curl/8.1.2"
  }
}
```
