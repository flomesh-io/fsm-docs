---
title: "Traffic Mirroring"
description: "Traffic mirroring in Kubernetes allows real-time data analysis without disrupting production traffic, enhancing diagnostics and security."
type: docs
weight: 40
draft: false
---

Traffic mirroring, sometimes also known as traffic cloning, is primarily used to send a copy of network traffic to another service without affecting production traffic. This feature is commonly utilized for fault diagnosis, performance monitoring, data analysis, and security auditing. Traffic mirroring enables real-time data capture and analysis without disrupting existing business processes.

The Kubernetes Gateway API’s [`HTTPRequestMirrorFilter`](https://gateway-api.sigs.k8s.io/reference/spec/#gateway.networking.k8s.io/v1.HTTPRequestMirrorFilter) provides a definition for traffic mirroring capabilities.

## Prerequisites

- Kubernetes cluster
- kubectl tool
- - FSM Gateway installed via [guide doc](/guides/traffic_management/ingress/fsm_gateway/installation).

## Demonstration

### Deploy Example Applications

To verify the traffic mirroring functionality, at least two backend services are needed. In these services, we will print the request headers to standard output to verify the mirroring functionality via log examination.

We use the programmable proxy [Pipy](https://github.com/flomesh-io/pipy) to simulate an echo service and print the request headers.

```shell
kubectl create namespace server
kubectl apply -n server -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  name: pipy
spec:
  selector:
    app: pipy
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8080

---
apiVersion: v1
kind: Pod
metadata:
  name: pipy
  labels:
    app: pipy
spec:
  containers:
  - name: pipy
    image: flomesh/pipy:1.0.0-1
    command: ["pipy", "-e", "pipy().listen(8080).serveHTTP(msg=>(console.log(msg.head),msg))"]
EOF
```

### Create Gateway and Route

Next, create a gateway and a route for the Service pipy.

```shell
kubectl apply -n server -f - <<EOF
apiVersion: gateway.networking.k8s.io/v1beta1
kind: Gateway
metadata:
  name: simple-fsm-gateway
spec:
  gatewayClassName: fsm-gateway-cls
  listeners:
  - protocol: HTTP
    port: 8000
    name: http
    allowedRoutes:
      namespaces:
        from: Same
---
apiVersion: gateway.networking.k8s.io/v1beta1
kind: HTTPRoute
metadata:
  name: http-route-sample
spec:
  parentRefs:
  - name: simple-fsm-gateway
    port: 8000
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /
    backendRefs:
    - name: pipy
      port: 8080
EOF
```

Attempt accessing the route:

```shell
curl http://$GATEWAY_IP:8000/ -d 'Hello world'
Hello world
```

You can view the logs of the pod pipy. Here, we use the [stern](https://github.com/stern/stern) tool to view logs from multiple pods simultaneously, and later we will deploy the mirror service.

```shell
stern . -c pipy -n server --tail 0
+ pipy › pipy
pipy › pipy 2024-04-28 03:57:03.918 [INF] { protocol: "HTTP/1.1", headers: { "host": "198.19.249.153:8000", "user-agent": "curl/8.4.0", "accept": "*/*", "content-type": "application/x-www-form-urlencoded", "x-forwarded-for": "10.42.0.1", "content-length": "11" }, headerNames: { "host": "Host", "user-agent": "User-Agent", "accept": "Accept", "content-type": "Content-Type" }, method: "POST", scheme:

 undefined, authority: undefined, path: "/" }
```

### Deploying Mirror Service

Next, let’s deploy a mirror service `pipy-mirror`, which can similarly print the request headers.

```shell
kubectl apply -n server -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  name: pipy-mirror
spec:
  selector:
    app: pipy-mirror
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8080
---
apiVersion: v1
kind: Pod
metadata:
  name: pipy-mirror
  labels:
    app: pipy-mirror
spec:
  containers:
  - name: pipy
    image: flomesh/pipy:1.0.0-1
    command: ["pipy", "-e", "pipy().listen(8080).serveHTTP(msg=>(console.log(msg.head),msg))"]
EOF
```

## Configure Traffic Mirroring Policy

Modify the HTTP route to add a `RequestMirror` type filter and set the `backendRef` to the mirror service `pipy-mirror` created above.

```shell
kubectl apply -n server -f - <<EOF
apiVersion: gateway.networking.k8s.io/v1beta1
kind: HTTPRoute
metadata:
  name: http-route-sample
spec:
  parentRefs:
  - name: simple-fsm-gateway
    port: 8000
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /
    filters:
    - type: RequestMirror
      requestMirror:
        backendRef:
          kind: Service
          name: pipy-mirror
          port: 8080
    backendRefs:
    - name: pipy
      port: 8080
EOF
```

After applying the policy, send another request and both pods should display the printed request headers.

```shell
stern . -c pipy -n server --tail 0
+ pipy › pipy
+ pipy-mirror › pipy
pipy-mirror pipy 2024-04-28 04:11:04.537 [INF] { protocol: "HTTP/1.1", headers: { "host": "198.19.249.153:8000", "user-agent": "curl/8.4.0", "accept": "*/*", "content-type": "application/x-www-form-urlencoded", "x-forwarded-for": "10.42.0.1", "content-length": "11" }, headerNames: { "host": "Host", "user-agent": "User-Agent", "accept": "Accept", "content-type": "Content-Type" }, method: "POST", scheme: undefined, authority: undefined, path: "/" }
pipy pipy 2024-04-28 04:11:04.537 [INF] { protocol: "HTTP/1.1", headers: { "host": "198.19.249.153:8000", "user-agent": "curl/8.4.0", "accept": "*/*", "content-type": "application/x-www-form-urlencoded", "x-forwarded-for": "10.42.0.1", "content-length": "11" }, headerNames: { "host": "Host", "user-agent": "User-Agent", "accept": "Accept", "content-type": "Content-Type" }, method: "POST", scheme: undefined, authority: undefined, path: "/" }
```
