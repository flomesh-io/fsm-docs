---
title: "Rate Limit"
description: "This document introduces the speed limiting function, including speed limiting based on ports, domain names, and routes."
type: docs
weight: 26
draft: false
---
Rate limiting in gateways is a crucial network traffic management strategy for controlling the data transfer rate through the gateway, essential for ensuring network stability and efficiency.

FSM Gateway's rate limiting can be implemented based on various criteria, including port, domain, and route.

- **Port-based Rate Limiting**: Controls the data transfer rate at the port, ensuring traffic does not exceed a set threshold. This is often used to prevent network congestion and server overload.
- **Domain-based Rate Limiting**: Sets request rate limits for specific domains. This strategy is typically used to control access frequency to certain services or applications to prevent overload and ensure service quality.
- **Route-based Rate Limiting**: Sets request rate limits for specific routes or URL paths. This approach allows for more granular traffic control within different parts of a single application.

## Configuration

For detailed configuration, please refer to [RateLimitPolicy API Reference](/api_reference/policyattachment/v1alpha1/#gateway.flomesh.io/v1alpha1.RateLimitPolicy).

- `targetRef` refers to the target resource for applying the policy, set here for port granularity, hence referencing the `Gateway` resource `simple-fsm-gateway`.
- `bps`: The default rate limit for the port, measured in bytes per second.
- `config`: L7 rate limiting configuration.
- `ports`
	- `port` specifies the port.
	- `bps` sets the bytes per second.
- `hostnames`
	- `hostname`: Domain name.
	- `config`: L7 rate limiting configuration.
- `http`
	- `match`:
		- `headers`: HTTP request matching.
		- `method`: HTTP method matching.
	- `config`: L7 rate limiting configuration.

L7 Rate Limiting Configuration:

- `backlog`: The backlog value refers to the number of requests the system allows to queue when the rate limit threshold is reached. This is an important field, especially when the system suddenly faces a large number of requests that may exceed the set rate limit threshold. The backlog value provides a buffer to handle requests exceeding the rate limit threshold but within the backlog limit. Once the backlog limit is reached, any new requests will be immediately rejected without waiting. This field is optional, defaulting to `10`.
- `requests`: The request value specifies the number of allowed visits within the rate limit time window. This is the core parameter of the rate limiting strategy, determining how many requests can be accepted within a specific time window. The purpose of setting this value is to ensure that the backend system does not receive more requests than it can handle within the given time window. This field is mandatory, with a minimum value of `1`.
- `statTimeWindow`: The rate limit time window (in seconds) defines the period for counting the number of requests. Rate limiting strategies are usually based on sliding or fixed windows. StatTimeWindow defines the size of this window. For example, if `statTimeWindow` is set to 60 seconds, and `requests` is 100, it means a maximum of 100 requests every 60 seconds. This field is mandatory.
- `burst`: The burst value represents the maximum number of requests allowed in a short time. This optional field is mainly used to handle short-term request spikes. The burst value is typically higher than the request value, allowing the number of accepted requests in a short time to exceed the average rate. This field is optional.
- `responseStatusCode`: The HTTP status code returned to the client when rate limiting occurs. This status code informs the client that the request was rejected due to reaching the rate limit threshold. Common status codes include `429 (Too Many Requests)`, but can be customized as needed. This field is mandatory.
- `responseHeadersToAdd`: HTTP headers to be added to the response when rate limiting occurs. This can be used to inform the client about more information regarding the rate limiting policy. For example, a `RateLimit-Limit` header can be added to inform the client of the rate limiting configuration. Additional useful information about the current rate limiting policy or how to contact the system administrator can also be provided. This field is optional.

## Prerequisites

- Kubernetes Cluster
- kubectl Tool
- FSM Gateway installed via [guide doc](/guides/traffic_management/ingress/fsm_gateway/installation).

## Demonstration

### Deploying a Sample Application

Next, deploy a sample application using the popular httpbin service, and create a [Gateway](https://gateway-api.sigs.k8s.io/api-types/gateway/) and [HTTP Route (HttpRoute)](https://gateway-api.sigs.k8s.io/api-types/httproute/).

```shell
kubectl create namespace httpbin
kubectl apply -n httpbin -f https://raw.githubusercontent.com/flomesh-io/fsm-docs/{{< param fsm_branch >}}/manifests/gateway/http-routing.yaml
```

Check the gateway and HTTP route, noting the creation of routes for two different domains.

```shell
kubectl get gateway,httproute -n httpbin
NAME                                                   CLASS             ADDRESS   PROGRAMMED   AGE
gateway.gateway.networking.k8s.io/simple-fsm-gateway   fsm-gateway-cls             Unknown      3s

NAME                                                 HOSTNAMES             AGE
httproute.gateway.networking.k8s.io/http-route-foo   ["foo.example.com"]   2s
httproute.gateway.networking.k8s.io/http-route-bar   ["bar.example.com"]   2s
```

Access the application to verify the HTTP route is effective.

```shell
export GATEWAY_IP=$(kubectl get svc -n httpbin -l app=fsm-gateway -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}')

curl http://$GATEWAY_IP:8000/headers -H 'host:foo.example.com'
{
  "headers": {
    "Accept": "*/*",
    "Connection": "keep-alive",
    "Host": "10.42.0.15:80",
    "User-Agent": "curl/7.81.0"
  }
}
```

## Rate Limiting Test

### Port-Based Rate Limiting

Create an 8k file.

```shell
dd if=/dev/zero of=payload bs=1K count=8
```

Test sending the file to the service, which only takes 1s.

```shell
time curl -s -X POST -T payload http://$GATEWAY_IP:8000/status/200 -H 'host:foo.example.com'

real	0m1.018s
user	0m0.001s
sys	0m0.014s
```

Then set the rate limiting policy:

- `targetRef` is the reference to the target resource of the policy, set here for port granularity, hence referencing the `Gateway` resource `simple-fsm-gateway`.
- `ports`
	- `port` specifies port 8000
	- `bps` sets the bytes per second to 2k

```shell
kubectl apply -n httpbin -f - <<EOF
apiVersion: gateway.flomesh.io/v1alpha1
kind: RateLimitPolicy
metadata:
  name: ratelimit-sample
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: Gateway
    name: simple-fsm-gateway
    namespace: httpbin
  ports:
    - port: 8000
      bps: 2048
EOF
```

After the policy takes effect, send the 8k file again. Now the rate limiting policy is in effect, and it takes 4 seconds.

```shell
time curl -s -X POST -T payload http://$GATEWAY_IP:8000/status/200 -H 'host:foo.example.com'

real	0m4.016s
user	0m0.007s
sys	0m0.005s
```

### Domain-Based Rate Limiting

Before testing domain-based rate limiting, delete the policy created above.

```shell
kubectl delete ratelimitpolicies -n httpbin ratelimit-sample
```

Then use fortio to generate load: 1 concurrent sending 1000 requests at 200 qps.

```shell
fortio load -quiet -c 1 -n 1000 -qps 200 -H 'host:foo.example.com' http://$GATEWAY_IP:8000/status/200

Code 200 : 1000 (100.0 %)
```

Next, set the rate limiting policy:

- Limiting domain `foo.example.com`
- Backlog of pending requests set to `1`
- Max requests in a `60s` window set to `200`
- Return `429` for rate-limited requests with response header `RateLimit-Limit: 200`

```shell
kubectl apply -n httpbin -f - <<EOF
apiVersion: gateway.flomesh.io/v1alpha1
kind: RateLimitPolicy
metadata:
  name: ratelimit-sample
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: HTTPRoute
    name: http-route-foo
    namespace: httpbin
  hostnames:
    - hostname: foo.example.com
      config: 
        backlog: 1
        requests: 100
        statTimeWindow: 60
        responseStatusCode: 429
        responseHeadersToAdd:
          - name: RateLimit-Limit
            value: "100"
EOF
```

After the policy is effective, generate the same load for testing. You can see that 200 responses are successful, and 798 are rate-limited.

> `-1` is the error code set by fortio during read timeout. This is because fortio's default timeout is `3s`, and the rate limiting policy sets the backlog to 1. FSM Gateway defaults to 2 threads, so there are 2 timed-out requests.

```shell
fortio load -quiet -c 1 -n 1000 -qps 200 -H 'host:foo.example.com' http://$GATEWAY_IP:8000/status/200

Code  -1 : 2 (0.2 %)
Code 200 : 200 (19.9 %)
Code 429 : 798 (79.9 %)
```

However, accessing `bar.example.com` will not be rate-limited.

```shell
fortio load -quiet -c 1 -n 1000 -qps 200 -H 'host:bar.example.com' http://$GATEWAY_IP:8000/status/200

Code 200 : 1000 (100.0 %)
```

### Route-Based Rate Limiting

Similarly, delete the previously created policy before starting the next test.

```shell
kubectl delete ratelimitpolicies -n httpbin ratelimit-sample
```

Before configuring the access policy,

 under the HTTP route `foo.example.com`, we add a route with the path prefix `/headers` to facilitate setting the access control policy for it.

```shell
kubectl apply -n httpbin -f - <<EOF
apiVersion: gateway.networking.k8s.io/v1beta1
kind: HTTPRoute
metadata:
  name: http-route-foo
spec:
  parentRefs:
  - name: simple-fsm-gateway
    port: 8000
  hostnames:
  - foo.example.com
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /status/200
    backendRefs:
    - name: httpbin
      port: 8080  
  - matches:
    - path:
        type: PathPrefix
        value: /
    backendRefs:
    - name: httpbin
      port: 8080
EOF
```

Update the rate limiting policy by adding route matching rules: prefix `/status/200`, other configurations remain unrestricted.

```shell
kubectl apply -n httpbin -f - <<EOF
apiVersion: gateway.flomesh.io/v1alpha1
kind: RateLimitPolicy
metadata:
  name: ratelimit-sample
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: HTTPRoute
    name: http-route-foo
    namespace: httpbin
  http:
    - match:
        path:
          type: PathPrefix
          value: /status/200        
      config: 
        backlog: 1
        requests: 100
        statTimeWindow: 60
        responseStatusCode: 429
        responseHeadersToAdd:
          - name: RateLimit-Limit
            value: "100"
EOF
```

After applying the policy, send the same load. From the results, only 200 requests are successful.

```shell
fortio load -quiet -c 1 -n 1000 -qps 200 -H 'host:foo.example.com' http://$GATEWAY_IP:8000/status/200

Code  -1 : 2 (0.2 %)
Code 200 : 200 (20.0 %)
Code 429 : 798 (79.8 %)
```

When the path `/status/204` is used, it will not be subject to rate limiting.

```shell
fortio load -quiet -c 1 -n 1000 -qps 200 -H 'host:foo.example.com' http://$GATEWAY_IP:8000/status/204

Code 204 : 1000 (100.0 %)
```
