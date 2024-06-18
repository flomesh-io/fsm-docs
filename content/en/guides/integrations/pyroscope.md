---
title: "Integrate Pyroscope with FSM"
description: "A simple demo showing how FSM integrates with Pyroscope for continuous profiling"
aliases: "/docs/integrations/demo_pyroscope"
type: docs
draft: true
weight: 5
---

## What is Pyroscope

Pyroscope is a continuous profiling tool which profiles the performance of a program written in variety of languages, GoLang included. It provides a great Web UI for reading the profiling results.

When a GoLang program exposes the web API endpoint provided by the built-in `net/http/pprof` library, Pyroscope can directly pull profiling results from the given endpoint. FSM exposes the required endpoint when debug server feature is enabled. This approach allows the integration of Pyroscope with no change to the FSM codebase.

## Enable FSM debug server

To enable FSM debug server at installation time, simply add `--set=fsm.enableDebugServer=true` argument to the `fsm install` command, or run `kubectl patch meshconfig fsm-mesh-config -n "$fsm_NAMESPACE" -p '{"spec":{"observability":{"enableDebugServer":true}}}' --type=merge` if FSM is already installed in the cluster.

## Install Pyroscope

In this section, we will install Pyroscope to profile FSM control plane. Currently only *fsm-controller* exposes pprof web endpoints.

First step is to add annotation to the `fsm-controller` service so that Pyroscope monitors it.

```bash
kubectl annotate -n "$fsm_NAMESPACE" svc fsm-controller  \
    "pyroscope.io/scrape=true" \
    "pyroscope.io/application-name=fsm-controller" \
    "pyroscope.io/spy-name=gospy" \
    "pyroscope.io/profile-cpu-enabled=true" \
    "pyroscope.io/profile-mem-enabled=true" \
    "pyroscope.io/port=9092"
```

Replace `$fsm_NAMESPACE` with the FSM namespace on your Kubernetes cluster. This command informs Pyroscope to profile both CPU and memory usages of the service. The pprof web endpoint is exposed on port 9092.

Next we can install Pyroscope with Helm.

```bash
helm install prof pyroscope \
    -f https://raw.githubusercontent.com/flomesh-io/fsm-docs/{{< param fsm_branch >}}/manifests/integrations/pyroscope-values.yaml \
    --repo https://pyroscope-io.github.io/helm-chart \
    -n "$fsm_NAMESPACE"
```

This command will install a service named `prof-pyroscope` in the fsm_NAMESPACE. Some configurations of Pyroscope can be found in the [pyroscope-values.yaml](https://raw.githubusercontent.com/flomesh-io/fsm-docs/{{< param fsm_branch >}}/manifests/integrations/pyroscope-values.yaml) file. You can make a copy of it on your local machine and edit the values if you want to customize the Pyroscope installation.

Check the installation by running:

```bash
kubectl get svc prof-pyroscope -n "$fsm_NAMESPACE"
```

By default, Pyroscope service exposes port 4040. You can visit the web UI after forwarding the port to your localhost:

```bash
kubectl port-forward service/prof-pyroscope 4040 -n "$fsm_NAMESPACE"
```

This command will keep the forwarded port open. Open [http://localhost:4040](http://localhost:4040) in your web browser to use Pyroscope. You should be able to see `fsm-controller` from the Application dropdown list like what is shown below:

<p align="center">
  <img src="/images/pyroscope-install.png" />
</p>

## Uninstall Pyroscope

To uninstall Pyroscope, run the command below:

```bash
helm uninstall prof -n "$fsm_NAMESPACE"
```

## References

* <a href="https://pyroscope.io/">Pyroscope project</a>
* <a href="https://pyroscope.io/docs/golang-pull-mode/">Pyroscope GoLang Pull Mode</a>

