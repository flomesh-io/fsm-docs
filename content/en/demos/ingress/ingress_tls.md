---
title: "Ingress Controller - Advanced TLS"
description: "FSM Ingress Controller advanced TLS features and configuration"
type: docs
weight: 11
---

This guide demonstrate how to configure TLS and its related functionality.

## Prerequisites

- Kubernetes cluster version {{< param min_k8s_version >}} or higher.
- Interact with the API server using `kubectl`.
- FSM CLI installed.
- FSM Ingress Controller installed followed by [installation document](/guides/traffic_management/ingress/fsm_ingress/installation/#installation)

Continuing with the previous article environment and providing examples of HTTP access at port `8000` and HTTPS access at port `8443`.

### Sample Application

The example application below  provides access through both **HTTP** at port `8000` and **HTTPS** at port `8443`, with the following URI:

- `/` returns a simple HTML page
- `/hi` returns a `200` response with string `Hi, there!`
- `/api/private` returns a `401` response with string `Staff only`


To provide HTTPS, a CA certificate and server certificate need to be issued for the application first.

```shell
openssl genrsa 2048 > ca-key.pem

openssl req -new -x509 -nodes -days 365000 \
   -key ca-key.pem \
   -out ca-cert.pem \
   -subj '/CN=flomesh.io'

openssl genrsa -out server-key.pem 2048
openssl req -new -key server-key.pem -out server.csr -subj '/CN=example.com'
openssl x509 -req -in server.csr -CA ca-cert.pem -CAkey ca-key.pem -CAcreateserial -out server-cert.pem -days 365
```

Before deploying the sample service, first let's create a `secret` to save the certificate and key in the secret and mount it in the application pod.

```yaml
kubectl create namespace httpbin
# mount self-signed cert to sample app pod via secret
kubectl create secret generic -n httpbin server-cert \
  --from-file=./server-cert.pem \
  --from-file=./server-key.pem

kubectl apply -n httpbin -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: httpbin
---
apiVersion: v1
kind: Service
metadata:
  name: httpbin
  labels:
    app: httpbin
    service: httpbin
spec:
  ports:
  - port: 8443
    name: https
  - port: 8000
    name: http
  selector:
    app: httpbin
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: httpbin
  labels:
    app: httpbin
spec:
  replicas: 1
  selector:
    matchLabels:
      app: httpbin
  template:
    metadata:
      labels:
        app: httpbin
    spec:
      containers:
        - name: pipy
          image: addozhang/httpbin:latest
          env:
            - name: PIPY_CONFIG_FILE
              value: /etc/pipy/tutorial/gateway/main.js
          ports:
            - containerPort: 8443
            - containerPort: 8000
          volumeMounts:
          - name: cert
            mountPath: "/etc/pipy/tutorial/gateway/secret"
            readOnly: true
      volumes:
      - name: cert
        secret:
          secretName: server-cert
EOF
```

### HTTPS Upstream

This example demonstrates how FSM Ingress can send requests to an HTTPS backend. FSM Ingress provides the following 3 annotations:

- `pipy.ingress.kubernetes.io/upstream-ssl-name`：SNI of the upstream service, such as `example.com`
- `pipy.ingress.kubernetes.io/upstream-ssl-secret`：Secret that contains the TLS certificate, formatted as `SECRET_NAME` or `NAMESPACE/SECRET_NAME`, such as `httpbin/tls-cert`
- `pipy.ingress.kubernetes.io/upstream-ssl-verify`：Whether to verify the certificate of the upstream, defaults to `false`, meaning that the connection will still be established even if the certificate validation fails.

In the following Ingress resource example, the annotation `pipy.ingress.kubernetes.io/upstream-ssl-secret` specifies the secret `tls-cert` that contains the TLS certificate in the namespace `httpbin`.


```shell
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: httpbin
  annotations:
    pipy.ingress.kubernetes.io/upstream-ssl-secret: httpbin/tls-cert
    pipy.ingress.kubernetes.io/upstream-ssl-verify: 'true'
spec:
  ingressClassName: pipy
  rules:
  - host: example.com
    http:
      paths:
        - path: /
          pathType: Prefix
          backend:
            service:
              name: httpbin
              port:
                number: 8443
```

To create the secret `tls-cert` with a certificate and key, you can use the following command:

```shell
kubectl create secret generic -n httpbin tls-cert \
  --from-file=tls.crt=./ca-cert.pem --from-file=ca.crt=./ca-cert.pem --from-file=tls.key=ca-key.pem
```

Apply the above Ingress configuration and access the HTTPS upstream application using HTTP ingress


```shell
curl http://example.com/hi --connect-to example.com:80:$HOST_IP:80
Hi, there!
```

Check the logs of the fsm-ingress pod to see that it is connecting to the upstream HTTPS port `8443`.

```console
kubectl logs -n fsm-system -l app=fsm-ingress | tail -5
2023-09-14 04:39:41.933 [INF] [router] Request Host:  example.com
2023-09-14 04:39:41.933 [INF] [router] Request Path:  /hi
2023-09-14 04:39:41.934 [INF] [balancer] _sourceIP 10.42.0.1
2023-09-14 04:39:41.934 [INF] [balancer] _connectTLS true
2023-09-14 04:39:41.934 [INF] [balancer] _mTLS true
2023-09-14 04:39:41.934 [INF] [balancer] _target.id 10.42.0.101:8443
2023-09-14 04:39:41.934 [INF] [balancer] _isOutboundGRPC false
```


### Client Certificate Verification

This example demonstrates how to verify client certificates when TLS termination and mTLS are enabled.

Before using the mTLS feature, ensure that FSM Ingress is enabled and configured with TLS, by providing the parameter `--set fsm.serviceLB.enabled=true` during FSM installation. 

**Note: This can be enabled ONLY during FSM installation.**

To enable the mTLS feature, you can either enable it during FSM Ingress installation by providing the parameter `--set fsm.fsmIngress.tls.mTLS=true` or modify the configuration after installation. The specific operation is to modify the `ConfigMap` `fsm-mesh-config` under the FSM namespace, and set the value of `tls.mTLS` to `true`. Or, enable it when enabling FSM ingress with command below:

```bash
fsm ingress enable --tls-enable --mtls
```

In FSM Ingress, the annotation `pipy.ingress.kubernetes.io/tls-trusted-ca-secret` is provided to configure trusted client certificates.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: httpbin
  annotations:
    pipy.ingress.kubernetes.io/tls-trusted-ca-secret: httpbin/trust-client-cert
spec:
  ingressClassName: pipy
  rules:
  - host: example.com
    http:
      paths:
        - path: /
          pathType: Prefix
          backend:
            service:
              name: httpbin
              port:
                number: 8000
  tls:
  - hosts:
    - example.com
    secretName: ingress-cert
```

To issue a self-signed certificate for an Ingress, you can run below command:

```shell
openssl req -x509 -newkey rsa:4096 -keyout ingress-key.pem -out ingress-cert.pem -sha256 -days 365 -nodes -subj '/CN=example.com'
```

Generate a `Secret` using generated certificate and privatey key by running below command:

```shell
kubectl create secret tls ingress-cert --cert=ingress-cert.pem --key=ingress-key.pem -n httpbin
```

issue a self-signed TLS certificate for client service

```shell
openssl req -x509 -newkey rsa:4096 -keyout client-key.pem -out client-cert.pem -sha256 -days 365 -nodes -subj '/CN=flomesh.io'
```

Generate a `Secret` resource by using generated self-signed client certificate.

```shell
kubectl create secret generic -n httpbin trust-client-cert \
  --from-file=ca.crt=./client-cert.pem
```

Apply above Ingress configurations.

```shell
curl --cacert ingress-cert.pem --cert client-cert.pem --key client-key.pem https://example.com/hi --connect-to example.com:443:$HOST_IP:443
Hi, there!
```