---
title: "Distributed Tracing Collaboration between FSM and OpenTelemetry"
description: "Show the collaboration between FSM and Otel for distributed tracing."
type: docs
weight: 4
---

This doc shows you the example bring your own (BYO) tracing colloctor for distributed tracing. The [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) works as the tracing collector to aggregate spans and sinks to Jaeger (in this example) or other system.

## Prerequisites

- Kubernetes cluster running Kubernetes {{< param min_k8s_version >}} or greater.
- FSM installed on the Kubernetes cluster.
- `kubectl` installed and access to the cluster's API server.
- `fsm` CLI installed.

## Jaeger

For the sake of demonstration, we use the `jaegertracing/all-in-one` image to deploy Jaeger here. This image includes components such as the Jaeger collector, memory storage, query service, and UI, making it very suitable for development and testing.

Enable support for [OTLP (OpenTelemetry Protocol)](https://opentelemetry.io/docs/specs/otlp/) through the environment variable `COLLECTOR_OTLP_ENABLED`.

```shell
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jaeger
spec:
  replicas: 1
  selector:
    matchLabels:
      app: jaeger
  template:
    metadata:
      labels:
        app: jaeger
    spec:
      containers:
      - name: jaeger
        image: jaegertracing/all-in-one:latest
        env:
        - name: COLLECTOR_OTLP_ENABLED
          value: "true"
        ports:
        - containerPort: 16686
        - containerPort: 14268
---
apiVersion: v1
kind: Service
metadata:
  name: jaeger
spec:
  selector:
    app: jaeger
  type: ClusterIP
  ports:
    - name: ui
      port: 16686
      targetPort: 16686
    - name: collector
      port: 14268
      targetPort: 14268
    - name: http
      protocol: TCP
      port: 4318
      targetPort: 4318
    - name: grpc
      protocol: TCP
      port: 4317
      targetPort: 4317      
EOF
```

## Install cert-manager

The Otel Operator relies on cert-manager for certificate management, and cert-manager needs to be installed before installing the operator.

```shell
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml
```

## Install OpenTelemetry Operator

Execute the following command to install Otel Operator.

```shell
kubectl apply -f https://github.com/open-telemetry/opentelemetry-operator/releases/latest/download/opentelemetry-operator.yaml
```

## Configuring OpenTelemetry Collector

For detailed configuration of the Otel collector, refer to the [official documentation](https://opentelemetry.io/docs/collector/configuration/).

- Receivers: configure `otlp` to receive tracing information from applications, and `zipkin` to receive reports from sidecar, using endpoint `0.0.0.0:9411`.
- Exporters: configure Jager's otlp endpoint `jaeger.default:4317`.
- Pipeline services: use `otlp` and `zipkin` as input sources, directing output to jaeger.

```shell
kubectl apply -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: otel
spec:
  config: |
    receivers:
      zipkin:
        endpoint: "0.0.0.0:9411"

    exporters:
      otlp/jaeger:
        endpoint: "jaeger.default:4317"
        tls:
          insecure: true

    service:
      pipelines:
        traces:
          receivers: [zipkin]
          exporters: [otlp/jaeger]
EOF
```

## Update Mesh Configuration

In order to aggregate spans to OpenTelemetry Collector, we need to let mesh know the address of aggregator.

Following the [FSM Tracing Doc](/guides/observability/tracing/#byo-bring-your-own), we can enable it during installation or update the configuration after installed.

```shell
kubectl patch meshconfig fsm-mesh-config -n fsm-system -p '{"spec":{"observability":{"tracing":{"enable":true,"address": "otel-collector.default","port":9411,"endpoint":"/api/v2/spans"}}}}'  --type=merge
```

## Deploy Sample Application

```shell
kubectl create namespace bookstore
kubectl create namespace bookbuyer
kubectl create namespace bookthief
kubectl create namespace bookwarehouse
fsm namespace add bookstore bookbuyer bookthief bookwarehouse
kubectl apply -f https://raw.githubusercontent.com/flomesh-io/fsm-docs/{{< param fsm_branch >}}/manifests/apps/bookbuyer.yaml
kubectl apply -f https://raw.githubusercontent.com/flomesh-io/fsm-docs/{{< param fsm_branch >}}/manifests/apps/bookthief.yaml
kubectl apply -f https://raw.githubusercontent.com/flomesh-io/fsm-docs/{{< param fsm_branch >}}/manifests/apps/bookstore.yaml
kubectl apply -f https://raw.githubusercontent.com/flomesh-io/fsm-docs/{{< param fsm_branch >}}/manifests/apps/bookwarehouse.yaml
kubectl apply -f https://raw.githubusercontent.com/flomesh-io/fsm-docs/{{< param fsm_branch >}}/manifests/apps/mysql.yaml
```

## Check Tracing

Check the Jaeger UI and you will get the tracing data there.

```shell
jaeger_pod="$(kubectl get pod -l app=jaeger -o jsonpath='{.items[0].metadata.name}')"                                                                 default ⎈
kubectl port-forward $jaeger_pod 16686:16686 &
```