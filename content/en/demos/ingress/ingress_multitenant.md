---
title: "FSM Ingress Controller - Multi-tenancy"
description: "Achieving multi-tenancy with FSM Ingress Controller"
type: docs
weight: 12
draft: true
---

This guide demonstrate how to use the FSM Ingress controller to create physical isolation of Ingress controllers when hosting multiple tenants in your Kubernetes cluster

### Prerequisites

- Kubernetes cluster version {{< param min_k8s_version >}} or higher.
- Interact with the API server using `kubectl`.
- FSM Ingress Controller installed followed by [installation document](/guides/traffic_management/ingress/fsm_ingress/installation/#installation)

Continuing with the previous article environment and providing examples of HTTP access at port `8000` and HTTPS access at port `8443`.

### Sample Application

In this demo, we will be deploying `httpbin` service under a namespace `httpbin`.

```sh
# Create Namespace
kubectl create ns httpbin

# Deploy sample
kubectl apply -f https://raw.githubusercontent.com/flomesh-io/fsm-docs/{{< param fsm_branch >}}/manifests/samples/httpbin/httpbin.yaml -n httpbin
```

Creating a standalone Ingress Controller

The next step is to create a separate Ingress Controller for the namespace `httpbin`.

```yaml
kubectl apply -f - <<EOF
apiVersion: flomesh.io/v1alpha1
kind: NamespacedIngress
metadata:
  name: namespaced-ingress-httpbin
  namespace: httpbin
spec:
  serviceType: LoadBalancer
  http:
    port:
      name: http
      port: 81
      nodePort: 30081
  resources:
    limits:
      cpu: 500m
      memory: 200Mi
    requests:
      cpu: 100m
      memory: 20Mi
EOF
```

After executing the above command, you will see an Ingress Controller running successfully under the namespace httpbin.

```sh
kubectl get po -n httpbin -l app=erie-canal-ingress-pipy
NAME                                               READY   STATUS    RESTARTS   AGE
erie-canal-ingress-pipy-httpbin-5594ffcfcc-zl5gl   1/1     Running   0          58s
```

At this point, there should be a corresponding Service under this namespace.

```sh
kubectl get svc -n httpbin -l app.kubernetes.io/component=controller
NAME                              TYPE           CLUSTER-IP     EXTERNAL-IP    PORT(S)        AGE
erie-canal-ingress-pipy-httpbin   LoadBalancer   10.43.62.120   192.168.1.11   81:30081/TCP   2m49s
```

Once you have the Ingress Controller, it's time to create the Ingress resource.

```yaml
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: httpbin
  namespace: httpbin
spec:
  ingressClassName: pipy
  rules:
  - host: httpbin.org
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: httpbin
            port:
              number: 14001
EOF
```

Now we have created Ingress resource, let's do a quick `curl` to see if things are working as expected.


For my local setup demo, LoadBalancer IP is `192.168.1.11`, your IP might be different. So ensure you are performing a `curl` against your setup ExternalIP.


```sh
curl -sI http://192.168.1.11:81/get -H "Host: httpbin.org"
HTTP/1.1 200 OK
server: gunicorn/19.9.0
date: Mon, 03 Oct 2022 12:02:04 GMT
content-type: application/json
content-length: 239
access-control-allow-origin: *
access-control-allow-credentials: true
connection: keep-alive
```