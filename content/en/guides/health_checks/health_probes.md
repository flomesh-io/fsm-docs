---
title: "Configure Health Probes"
description: "How FSM handles application health probes work and what to do if they fail"
aliases: "/docs/application_health_probes"
type: "docs"
---

## Overview

Implementing [health probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) in your application is a great way for Kubernetes to automate some tasks to improve availability in the event of an error.

Because FSM reconfigures application Pods to redirect all incoming and outgoing network traffic through the proxy sidecar, `httpGet` and `tcpSocket` health probes invoked by the kubelet will fail due to the lack of any mTLS context required by the proxy.

For `httpGet` health probes to continue to work as expected from within the mesh, FSM adds configuration to expose the probe endpoint via the proxy and rewrites the probe definitions for new Pods to refer to the proxy-exposed endpoint. All of the functionality of the original probe is still used, FSM simply fronts it with the proxy so the kubelet can communicate with it.

Special configuration is required to support `tcpSocket` health probes in the mesh. Since FSM redirects all network traffic through Pipy, all ports appear open in the Pod. This causes all TCP connections routed to Pod's injected with an Pipy sidecar to appear successful. For `tcpSocket` health probes to work as expected in the mesh, FSM rewrites the probes to be `httpGet` probes and adds an `iptables` command to bypass the Pipy proxy at the `fsm-healthcheck` exposed endpoint. The `fsm-healthcheck` container is added to the Pod and handles the HTTP health probe requests from kubelet. The handler gets the original TCP port from the request's `Original-Tcp-port` header and attempts to open a socket on the specified port. The response status code for the `httpGet` probe will reflect if the TCP connection was successful.

| Probe       | Path                 | Port  |
| ----------- | -------------------- | ----- |
| Liveness    | /fsm-liveness-probe  | 15901 |
| Readiness   | /fsm-readiness-probe | 15902 |
| Startup     | /fsm-startup-probe   | 15903 |
| Healthcheck | /fsm-healthcheck     | 15904 |

For HTTP and `tcpSocket` probes, the port and path are modified. For HTTPS probes, the port is modified, but the path is left unchanged.

Only predefined `httpGet` and `tcpSocket` probes are modified. If a probe is undefined, one will not be added in its place. `exec` probes (including those using `grpc_health_probe`) are never modified and will continue to function as expected as long as the command does not require network access outside of `localhost`.

## Examples

The following examples show how FSM handles health probes for Pods in a mesh.

### HTTP

Consider a Pod spec defining a container with the following `livenessProbe`:

```yaml
livenessProbe:
  httpGet:
    path: /liveness
    port: 14001
    scheme: HTTP
```

When the Pod is created, FSM will modify the probe to be the following:

```yaml
livenessProbe:
  httpGet:
    path: /fsm-liveness-probe
    port: 15901
    scheme: HTTP
```

The Pod's proxy will contain the following Pipy configuration.

An Pipy cluster which maps to the original probe port 14001:

```json
{
  "Probes": {
      "ReadinessProbes": null,
      "LivenessProbes": [
        {
          "httpGet": {
            "path": "/fsm-liveness-probe",
            "port": 15901,
            "scheme": "HTTP"
          },
          "timeoutSeconds": 1,
          "periodSeconds": 10,
          "successThreshold": 1,
          "failureThreshold": 3
        }
      ],
      "StartupProbes": null
    }
  }
}
```

A listener for the new proxy-exposed HTTP endpoint at `/fsm-liveness-probe` on port 15901 mapping to the cluster above:

```js
.listen(probeScheme ? 15901 : 0)
.link(
  'http_liveness', () => probeScheme === 'HTTP',
  'connection_liveness', () => Boolean(probeTarget),
  'deny_liveness'
)
```

### `tcpSocket`

Consider a Pod spec defining a container with the following `livenessProbe`:

```yaml
livenessProbe:
  tcpSocket:
    port: 14001
```

When the Pod is created, FSM will modify the probe to be the following:

```yaml
livenessProbe:
  httpGet:
    httpHeaders:
    - name: Original-Tcp-Port
      value: "14001"
    path: /fsm-healthcheck
    port: 15904
    scheme: HTTP
```

Requests to port 15904 bypass the Pipy proxy and are directed to the `fsm-healthcheck` endpoint.

## How to Verify Health of Pods in the Mesh

Kubernetes will automatically poll the health endpoints of Pods configured with startup, liveness, and readiness probes.

When a startup probe fails, Kubernetes will generate an Event (visible by `kubectl describe pod <pod name>`) and restart the Pod. The `kubectl describe` output may look like this:

```console
...
Events:
  Type     Reason     Age              From               Message
  ----     ------     ----             ----               -------
  Normal   Scheduled  17s              default-scheduler  Successfully assigned bookstore/bookstore-v1-699c79b9dc-5g8zn to fsm-control-plane
  Normal   Pulled     16s              kubelet            Successfully pulled image "flomesh/init:latest-main" in 26.5835ms
  Normal   Created    16s              kubelet            Created container fsm-init
  Normal   Started    16s              kubelet            Started container fsm-init
  Normal   Pulling    16s              kubelet            Pulling image "flomesh/init:latest-main"
  Normal   Pulling    15s              kubelet            Pulling image "flomesh/pipy:0.5.0"
  Normal   Pulling    15s              kubelet            Pulling image "flomesh/bookstore:latest-main"
  Normal   Pulled     15s              kubelet            Successfully pulled image "flomesh/bookstore:latest-main" in 319.9863ms
  Normal   Started    15s              kubelet            Started container bookstore-v1
  Normal   Created    15s              kubelet            Created container bookstore-v1
  Normal   Pulled     14s              kubelet            Successfully pulled image "flomesh/pipy:0.5.0" in 755.2666ms
  Normal   Created    14s              kubelet            Created container pipy
  Normal   Started    14s              kubelet            Started container pipy
  Warning  Unhealthy  13s              kubelet            Startup probe failed: Get "http://10.244.0.23:15903/fsm-startup-probe": dial tcp 10.244.0.23:15903: connect: connection refused
  Warning  Unhealthy  3s (x2 over 8s)  kubelet            Startup probe failed: HTTP probe failed with statuscode: 503
```

When a liveness probe fails, Kubernetes will generate an Event (visible by `kubectl describe pod <pod name>`) and restart the Pod. The `kubectl describe` output may look like this:

```console
...
Events:
  Type     Reason     Age                From               Message
  ----     ------     ----               ----               -------
  Normal   Scheduled  59s                default-scheduler  Successfully assigned bookstore/bookstore-v1-746977967c-jqjt4 to fsm-control-plane
  Normal   Pulling    58s                kubelet            Pulling image "flomesh/init:latest-main"
  Normal   Created    58s                kubelet            Created container fsm-init
  Normal   Started    58s                kubelet            Started container fsm-init
  Normal   Pulled     58s                kubelet            Successfully pulled image "flomesh/init:latest-main" in 23.415ms
  Normal   Pulled     57s                kubelet            Successfully pulled image "flomesh/pipy:0.5.0" in 678.1391ms
  Normal   Pulled     57s                kubelet            Successfully pulled image "flomesh/bookstore:latest-main" in 230.3681ms
  Normal   Created    57s                kubelet            Created container pipy
  Normal   Pulling    57s                kubelet            Pulling image "flomesh/pipy:0.5.0"
  Normal   Started    56s                kubelet            Started container pipy
  Normal   Pulled     44s                kubelet            Successfully pulled image "flomesh/bookstore:latest-main" in 20.6731ms
  Normal   Created    44s (x2 over 57s)  kubelet            Created container bookstore-v1
  Normal   Started    43s (x2 over 57s)  kubelet            Started container bookstore-v1
  Normal   Pulling    32s (x3 over 58s)  kubelet            Pulling image "flomesh/bookstore:latest-main"
  Warning  Unhealthy  32s (x6 over 50s)  kubelet            Liveness probe failed: HTTP probe failed with statuscode: 503
  Normal   Killing    32s (x2 over 44s)  kubelet            Container bookstore-v1 failed liveness probe, will be restarted
```

When a readiness probe fails, Kubernetes will generate an Event (visible with `kubectl describe pod <pod name>`) and ensure no traffic destined for Services the Pod may be backing is routed to the unhealthy Pod. The `kubectl describe` output for a Pod with a failing readiness probe may look like this:

```console
...
Events:
  Type     Reason     Age               From               Message
  ----     ------     ----              ----               -------
  Normal   Scheduled  32s               default-scheduler  Successfully assigned bookstore/bookstore-v1-5848999cb6-hp6qg to fsm-control-plane
  Normal   Pulling    31s               kubelet            Pulling image "flomesh/init:latest-main"
  Normal   Pulled     31s               kubelet            Successfully pulled image "flomesh/init:latest-main" in 19.8726ms
  Normal   Created    31s               kubelet            Created container fsm-init
  Normal   Started    31s               kubelet            Started container fsm-init
  Normal   Created    30s               kubelet            Created container bookstore-v1
  Normal   Pulled     30s               kubelet            Successfully pulled image "flomesh/bookstore:latest-main" in 314.3628ms
  Normal   Pulling    30s               kubelet            Pulling image "flomesh/bookstore:latest-main"
  Normal   Started    30s               kubelet            Started container bookstore-v1
  Normal   Pulling    30s               kubelet            Pulling image "flomesh/pipy:0.5.0"
  Normal   Pulled     29s               kubelet            Successfully pulled image "flomesh/pipy:0.5.0" in 739.3931ms
  Normal   Created    29s               kubelet            Created container pipy
  Normal   Started    29s               kubelet            Started container pipy
  Warning  Unhealthy  0s (x3 over 20s)  kubelet            Readiness probe failed: HTTP probe failed with statuscode: 503
```

The Pod's `status` will also indicate that it is not ready which is shown in its `kubectl get pod` output. For example:

```console
NAME                            READY   STATUS    RESTARTS   AGE
bookstore-v1-5848999cb6-hp6qg   1/2     Running   0          85s
```

The Pods' health probes may also be invoked manually by forwarding the Pod's necessary port and using `curl` or any other HTTP client to issue requests. For example, to verify the liveness probe for the bookstore-v1 demo Pod, forward port 15901:

```bash
kubectl port-forward -n bookstore deployment/bookstore-v1 15901
```

Then, in a separate terminal instance, `curl` may be used to check the endpoint. The following example shows a healthy bookstore-v1:

```console
curl -i localhost:15901/fsm-liveness-probe
HTTP/1.1 200 OK
date: Wed, 31 Mar 2021 16:00:01 GMT
content-length: 1396
content-type: text/html; charset=utf-8
x-pipy-upstream-service-time: 1
server: pipy

<!doctype html>
<html itemscope="" itemtype="http://schema.org/WebPage" lang="en">
  ...
</html>
```

## Known issues

- [#3773](https://github.com/openservicemesh/osm/issues/3773)

## Troubleshooting

If any health probes are consistently failing, perform the following steps to identify the root cause:

1. Verify `httpGet` and `tcpSocket` probes on Pods in the mesh have been modified.

   Startup, liveness, and readiness `httpGet` probes must be modified by FSM in order to continue to function while in a mesh. Ports must be modified to 15901, 15902, and 15903 for liveness, readiness, and startup `httpGet` probes, respectively. Only HTTP (not HTTPS) probes will have paths modified in addition to be `/fsm-liveness-probe`, `/fsm-readiness-probe`, or `/fsm-startup-probe`.

   Also, verify the Pod's Pipy configuration contains a listener for the modified endpoint.

   For `tcpSocket` probes to function in the mesh, they must be rewritten to `httpGet` probes. The ports must be modified to 15904 for liveness, readiness, and startup probes. The path the must be set to `/fsm-healthcheck`. A HTTP header, `Original-Tcp-Port`, must be set to the original port specified in the `tcpSocket` probe definition. Also, verify that the `fsm-healthcheck` container is running. Inspect the `fsm-healthcheck` logs for more information.

   See the [examples above](#examples) for more details.

2. Determine if Kubernetes encountered any other errors while scheduling or starting the Pod.

   Look for any errors that may have recently occurred with `kubectl describe` of the unhealthy Pod. Resolve any errors and verify the Pod's health again.

3. Determine if the Pod encountered a runtime error.

   Look for any errors that may have occurred after the container started by inspecting its logs with `kubectl logs`. Resolve any errors and verify the Pod's health again.
