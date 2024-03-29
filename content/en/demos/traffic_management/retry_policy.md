---
title: "Retry Policy"
description: "Using retries to enhance service availability"
type: docs
weight: 15
---

This guide demonstrates how to configure retry policy for a client and server application within the service mesh.

## Prerequisites

- Kubernetes cluster running Kubernetes {{< param min_k8s_version >}} or greater.
- Have `kubectl` available to interact with the API server.
- Have `fsm` CLI available for managing the service mesh.

## Demo

1. Install FSM with permissive mode and retry policy enabled.

    ```bash
    fsm install --set=fsm.enablePermissiveTrafficPolicy=true --set=fsm.featureFlags.enableRetryPolicy=true
    ```

1. Deploy the `httpbin` service into the `httpbin` namespace after enrolling its namespace to the mesh. The `httpbin` service runs on port `14001`.

    ```bash
    kubectl create namespace httpbin

    fsm namespace add httpbin

    kubectl apply -f https://raw.githubusercontent.com/flomesh-io/fsm-docs/{{< param fsm_branch >}}/manifests/samples/httpbin/httpbin.yaml -n httpbin
    ```

    Confirm the `httpbin` service and pods are up and running.

    ```bash
    kubectl get svc,pod -n httpbin
    ```

    Should look similar to below

    ```console
    NAME      TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)     AGE
    httpbin   ClusterIP   10.96.198.23   <none>        14001/TCP   20s

    NAME                     READY   STATUS    RESTARTS   AGE
    httpbin-5b8b94b9-lt2vs   2/2     Running   0          20s
    ```

1. Deploy the `curl` into the `curl` namespace after enrolling its namespace to the mesh.

    ```bash
    kubectl create namespace curl

    fsm namespace add curl

    kubectl apply -f https://raw.githubusercontent.com/flomesh-io/fsm-docs/{{< param fsm_branch >}}/manifests/samples/curl/curl.yaml -n curl
    ```

    Confirm the `curl` pod is up and running.

    ```bash
    kubectl get pods -n curl
    ```

    Should look similar to below.

    ```console
    NAME                    READY   STATUS    RESTARTS   AGE
    curl-54ccc6954c-9rlvp   2/2     Running   0          20s
     ```

1. Apply the Retry policy to retry when the `curl` ServiceAccount receives a `5xx` code when sending a request to `httpbin` Service.

    ```bash
    kubectl apply -f - <<EOF
    kind: Retry
    apiVersion: policy.flomesh.io/v1alpha1
    metadata:
      name: retry
      namespace: curl
    spec:
      source:
        kind: ServiceAccount
        name: curl
        namespace: curl
      destinations:
      - kind: Service
        name: httpbin
        namespace: httpbin
      retryPolicy:
        retryOn: "5xx"
        perTryTimeout: 1s
        numRetries: 5
        retryBackoffBaseInterval: 1s
    EOF
    ```

1. Send a HTTP request that returns status code `503` from the `curl` pod to the `httpbin` service.

    ```bash
    curl_client="$(kubectl get pod -n curl -l app=curl -o jsonpath='{.items[0].metadata.name}')"
    kubectl exec "$curl_client" -n curl -c curl -- curl -sI httpbin.httpbin.svc.cluster.local:14001/status/503
    ```

    Returned result might look like

    ```bash
    HTTP/1.1 503 SERVICE UNAVAILABLE
    server: gunicorn
    date: Tue, 14 Feb 2023 11:11:51 GMT
    content-type: text/html; charset=utf-8
    access-control-allow-origin: *
    access-control-allow-credentials: true
    content-length: 0
    connection: keep-alive
    ```

2. Query for the stats between `curl` to `httpbin`.

    ```bash
    curl_client="$(kubectl get pod -n curl -l app=curl -o jsonpath='{.items[0].metadata.name}')"
    fsm proxy get stats -n curl "$curl_client" | grep upstream_rq_retry
    ```

    The number of times the request from the `curl` pod to the `httpbin` pod was retried using the exponential backoff retry should be equal to the `numRetries` field in the retry policy.

    The `upstream_rq_retry_limit_exceeded` stat shows the number of requests not retried because it's more than the maximum retries allowed - `numRetries`.

     ```console
    cluster.httpbin/httpbin|14001.upstream_rq_retry: 4
    cluster.httpbin/httpbin|14001.upstream_rq_retry_backoff_exponential: 4
    cluster.httpbin/httpbin|14001.upstream_rq_retry_backoff_ratelimited: 0
    cluster.httpbin/httpbin|14001.upstream_rq_retry_limit_exceeded: 1
    cluster.httpbin/httpbin|14001.upstream_rq_retry_overflow: 0
    cluster.httpbin/httpbin|14001.upstream_rq_retry_success: 0
    ```

3. Send a HTTP request that returns a non-5xx status code from the `curl` pod to the `httpbin` service.

    ```bash
    curl_client="$(kubectl get pod -n curl -l app=curl -o jsonpath='{.items[0].metadata.name}')"
    kubectl exec "$curl_client" -n curl -c curl -- curl -sI httpbin.httpbin.svc.cluster.local:14001/status/404
    ```

    Returned result might look something like

    ```bash
    HTTP/1.1 404 NOT FOUND
    server: gunicorn
    date: Tue, 14 Feb 2023 11:18:56 GMT
    content-type: text/html; charset=utf-8
    access-control-allow-origin: *
    access-control-allow-credentials: true
    content-length: 0
    connection: keep-alive
    ```
