---
title: "Cert-manager Certificate Provider"
description: "Using cert-manager as a certificate provider"
type: docs
weight: 30
---

This guide demonstrates the usage of [cert-manager][1] as a certificate provider to manage and issue certificates in FSM.

## Prerequisites

- Kubernetes cluster running Kubernetes {{< param min_k8s_version >}} or greater.
- Have `kubectl` available to interact with the API server.
- Have `fsm` CLI available for installing and managing the service mesh.


## Demo

The following demo uses [cert-manager][1] as the certificate provider to issue certificates to the `curl` and `httpbin` applications communicating over `Mutual TLS (mTLS)` in an FSM managed service mesh.

1. Install `cert-manager`. This demo uses `cert-manager v1.6.1`.
    ```bash
    kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.6.1/cert-manager.yaml
    ```

    Confirm the pods are ready and running in the `cert-manager` namespace.

    ```console
    kubectl get pod -n cert-manager
    NAME                                      READY   STATUS    RESTARTS   AGE
    cert-manager-55658cdf68-pdnzg             1/1     Running   0          2m33s
    cert-manager-cainjector-967788869-prtjq   1/1     Running   0          2m33s
    cert-manager-webhook-6668fbb57d-vzm4j     1/1     Running   0          2m33s
    ```

2. Configure `cert-manager` `Issuer` and `Certificate` resources required by `cert-manager` to be able to issue certificates in FSM. These resources must be created in the namespace where FSM will be installed later.
    > Note: `cert-manager` must first be installed, with an issuer ready, before FSM can be installed using `cert-manager` as the certificate provider.

    Create the namespace where FSM will be installed.

    ```bash
    export FSM_NAMESPACE=fsm-system # Replace fsm-system with the namespace where FSM is installed
    kubectl create namespace "$FSM_NAMESPACE"
    ```

    Next, we use a `SelfSigned` issuer to bootstrap a custom root certificate. This will create a `SelfSigned` issuer, issue a root certificate, and use that root as a `CA` issuer for certificates issued to workloads within the mesh.

    ```bash
    # Create Issuer and Certificate resources
    kubectl apply -f - <<EOF
    apiVersion: cert-manager.io/v1
    kind: Issuer
    metadata:
      name: selfsigned
      namespace: "$FSM_NAMESPACE"
    spec:
      selfSigned: {}
    ---
    apiVersion: cert-manager.io/v1
    kind: Certificate
    metadata:
      name: fsm-ca
      namespace: "$FSM_NAMESPACE"
    spec:
      isCA: true
      duration: 87600h # 365 days
      secretName: fsm-ca-bundle
      commonName: fsm-system
      issuerRef:
        name: selfsigned
        kind: Issuer
        group: cert-manager.io
    ---
    apiVersion: cert-manager.io/v1
    kind: Issuer
    metadata:
      name: fsm-ca
      namespace: "$FSM_NAMESPACE"
    spec:
      ca:
        secretName: fsm-ca-bundle
    EOF
    ```

3. Confirm the `fsm-ca-bundle` CA secret is created by `cert-manager` in FSM's namespace.
   
    ```console
    kubectl get secret fsm-ca-bundle -n "$FSM_NAMESPACE"
    NAME            TYPE                DATA   AGE
    fsm-ca-bundle   kubernetes.io/tls   3      84s
    ```

    The CA certificate saved in this secret will be used by FSM upon install to bootstrap its ceritifcate provider utility.

4. Install FSM with its certificate provider kind set to `cert-manager`.
   
    ```bash
    fsm install --set fsm.certificateProvider.kind="cert-manager"
    ```

    Confirm the FSM control plane pods are ready and running.
    
    ```console
    kubectl get pod -n "$FSM_NAMESPACE"
    NAME                              READY   STATUS    RESTARTS   AGE
    fsm-bootstrap-7ddc6f9b85-k8ptp    1/1     Running   0          2m52s
    fsm-controller-79b777889b-mqk4g   1/1     Running   0          2m52s
    fsm-injector-5f96468fb7-p77ps     1/1     Running   0          2m52s
    ```

5. Enable permissive traffic policy mode to set up automatic application connectivity.
    > Note: this is not a requirement to use `cert-manager` but simplifies the demo by not requiring explicit traffic policies for application connectivity.

    ```bash
    kubectl patch meshconfig fsm-mesh-config -n "$FSM_NAMESPACE" -p '{"spec":{"traffic":{"enablePermissiveTrafficPolicyMode":true}}}'  --type=merge
    ```

6. Deploy the `httpbin` service into the `httpbin` namespace after enrolling its namespace to the mesh. The `httpbin` service runs on port `14001`.

    ```bash
    # Create the httpbin namespace
    kubectl create namespace httpbin

    # Add the namespace to the mesh
    fsm namespace add httpbin

    # Deploy httpbin service in the httpbin namespace
    kubectl apply -f https://raw.githubusercontent.com/flomesh-io/fsm-docs/{{< param fsm_branch >}}/manifests/samples/httpbin/httpbin.yaml -n httpbin
    ```

    Confirm the `httpbin` service and pods are up and running.

    ```console
    kubectl get svc -n httpbin
    NAME      TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)     AGE
    httpbin   ClusterIP   10.96.198.23   <none>        14001/TCP   20s
    ```

    ```console
    kubectl get pods -n httpbin
    NAME                     READY   STATUS    RESTARTS   AGE
    httpbin-5b8b94b9-lt2vs   2/2     Running   0          20s
    ```

7. Deploy the `curl` client into the `curl` namespace after enrolling its namespace to the mesh.

    ```bash
    # Create the curl namespace
    kubectl create namespace curl

    # Add the namespace to the mesh
    fsm namespace add curl

    # Deploy curl client in the curl namespace
    kubectl apply -f https://raw.githubusercontent.com/flomesh-io/fsm-docs/{{< param fsm_branch >}}/manifests/samples/curl/curl.yaml -n curl
    ```

    Confirm the `curl` client pod is up and running.

    ```console
    kubectl get pods -n curl
    NAME                    READY   STATUS    RESTARTS   AGE
    curl-54ccc6954c-9rlvp   2/2     Running   0          20s
    ```

8.  Confirm the `curl` client is able to access the `httpbin` service on port `14001`.

    ```console
    kubectl exec -n curl -ti "$(kubectl get pod -n curl -l app=curl -o jsonpath='{.items[0].metadata.name}')" -c curl -- curl -I http://httpbin.httpbin:14001
    #Response as below
    HTTP/1.1 200 OK
    server: gunicorn/19.9.0
    date: Mon, 04 Jul 2022 09:34:11 GMT
    content-type: text/html; charset=utf-8
    content-length: 9593
    access-control-allow-origin: *
    access-control-allow-credentials: true
    connection: keep-alive
    ```

    A `200 OK` response indicates the HTTP request from the `curl` client to the `httpbin` service was successful. The traffic between the application sidecar proxies is encrypted and authenticated using `Mutual TLS (mTLS)` by leverging the certificates issued by the `cert-manager` certificate provider.


[1]: https://cert-manager.io/