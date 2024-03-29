---
title: "Upgrade the FSM Control Plane"
description: "Upgrade Guide"
aliases: ["/docs/upgrade_guide","/docs/troubleshooting/cli/mesh_upgrade"]
type: docs
weight: 3
---

This guide describes how to upgrade the FSM control plane.

## How upgrades work

FSM's control plane lifecycle is managed by Helm and can be upgraded with [Helm's upgrade functionality](https://helm.sh/docs/intro/using_helm/#helm-upgrade-and-helm-rollback-upgrading-a-release-and-recovering-on-failure), which will patch or replace control plane components as needed based on changed values and resource templates.

### Resource availability during upgrade
Since upgrades may include redeploying the fsm-controller with the new version, there may be some downtime of the controller. While the fsm-controller is unavailable, there will be a delay in processing new SMI resources, creating new pods to be injected with a proxy sidecar container will fail, and mTLS certificates will not be rotated.

Already existing SMI resources will be unaffected, this means that the data plane (which includes the Pipy sidecar configs) will also be unaffected by upgrading.

Data plane interruptions are expected if the upgrade includes CRD changes. Streamlining data plane upgrades is being tracked in issue [#512](https://github.com/openservicemesh/osm/issues/512).

## Policy

Only certain upgrade paths are tested and supported.

**Note**: These plans are tentative and subject to change.

Breaking changes in this section refer to incompatible changes to the following user-facing components:
- `fsm` CLI commands, flags, and behavior
- SMI CRDs and controllers

This implies the following are NOT user-facing and incompatible changes are NOT considered "breaking" as long as the incompatibility is handled by user-facing components:
- Chart values.yaml
- `fsm-mesh-config` MeshConfig
- Internally-used labels and annotations (monitored-by, injection, metrics, etc.)

Upgrades are only supported between versions that do not include breaking changes, as described below.

For FSM versions `0.y.z`:
- Breaking changes will not be introduced between `0.y.z` and `0.y.z+1`
- Breaking changes may be introduced between `0.y.z` and `0.y+1.0`

For FSM versions `x.y.z` where `x >= 1`:
- Breaking changes will not be introduced between `x.y.z` and `x.y+1.0` or between `x.y.z` and `x.y.z+1`
- Breaking changes may be introduced between `x.y.z` and `x+1.0.0`

## How to upgrade FSM

The recommended way to upgrade a mesh is with the `fsm` CLI. For advanced use cases, `helm` may be used.

### CRD Upgrades
Because Helm does not manage CRDs beyond the initial installation, FSM leverages an init-container on the `fsm-bootstrap` pod to to update existing and add new CRDs during an upgrade. If the new release contains updates to existing CRDs or adds new CRDs, the `init-fsm-bootstrap` on the `fsm-bootstrap` pod will update the CRDs. The associated Custom Resources will remain as is, requiring no additional action prior to or immediately after the upgrade.

Please check the `CRD Updates` section of the [release notes](https://github.com/flomesh-io/fsm/releases) to see if any updates have been made to the CRDs used by FSM. If the version of the Custom Resources are within the versions the updated CRD supports, no immediate action is required. FSM implements a conversion webhook for all of its CRDs, ensuring support for older versions and providing the flexibilty to update Custom Resources at a later point in time.

### Upgrading with the FSM CLI

**Pre-requisites**

- Kubernetes cluster with the FSM control plane installed
    - Ensure that the Kubernetes cluster has the minimum Kubernetes version required by the new FSM chart. This can be found in the [Installation Pre-requisites](/getting_started/setup_fsm#prerequisites)
- `fsm` CLI installed 
  - By default, the `fsm` CLI will upgrade to the same chart version that it installs. e.g. v0.9.2 of the `fsm` CLI will upgrade to v0.9.2 of the FSM Helm chart. Upgrading to any other version of the Helm chart than the version matching the CLI may work, but those scenarios are not tested and issues that arise may not get fixed even if reported.

The `fsm mesh upgrade` command performs a `helm upgrade` of the existing Helm release for a mesh.

Basic usage requires no additional arguments or flags:
```console
fsm mesh upgrade
FSM successfully upgraded mesh fsm
```

This command will upgrade the mesh with the default mesh name in the default FSM namespace. Values from the previous release will NOT carry over to the new release by default, but may be passed individually with the `--set` flag on `fsm mesh upgrade`.

See `fsm mesh upgrade --help` for more details

### Upgrading with Helm

#### Pre-requisites

- Kubernetes cluster with the FSM control plane installed
- The [helm 3 CLI](https://helm.sh/docs/intro/install/)

#### FSM Configuration
When upgrading, any custom settings used to install or run FSM may be reverted to the default, this only includes any metrics deployments. Please ensure that you carefully follow the guide to prevent these values from being overwritten.

To preserve any changes you've made to the FSM configuration, use the `helm --values` flag. Create a copy of the [values file](https://github.com/flomesh-io/fsm/blob/{{< param fsm_branch >}}/charts/fsm/values.yaml) (make sure to use the version for the upgraded chart) and change any values you wish to customize. You can omit all other values.

**Note: Any configuration changes that go into the MeshConfig will not be applied during upgrade and the values will remain as is prior to the upgrade. If you wish to update any value in the MeshConfig you can do so by patching the resource after an upgrade.

For example, if the `logLevel` field in the MeshConfig was set to `info` prior to upgrade, updating this in `override.yaml` will during an upgrade will not cause any change.

<b>Warning:</b> Do NOT change `fsm.meshName` or `fsm.fsmNamespace`

#### Helm Upgrade
Then run the following `helm upgrade` command.
```console
helm upgrade <mesh name> fsm --repo https://flomesh-io.github.io/fsm --version <chart version> --namespace <fsm namespace> --values override.yaml
```
Omit the `--values` flag if you prefer to use the default settings.

Run `helm upgrade --help` for more options.

## Upgrading Third Party Dependencies

### Pipy

Pipy versions can be updated by modifying the value of the `sidecarImage` variable in fsm-mesh-config. For example, to update [Pipy image](https://hub.docker.com/r/flomesh/pipy) to latest (this is for example only, the latest image is not recommended), the next command should be run.

```bash
export fsm_namespace=fsm-system # Replace fsm-system with the namespace where FSM is installed
kubectl patch meshconfig fsm-mesh-config -n $fsm_namespace -p '{"spec":{"sidecar":{"sidecarImage": "flomesh/pipy:latest"}}}' --type=merge
```

After the MeshConfig resource has been updated, all Pods and deployments that are part of the mesh must be restarted so that the updated version of the Pipy sidecar can be injected onto the Pod as part of the automated sidecar injection performed by FSM. This can be done with the `kubectl rollout restart deploy` command.

### Prometheus, Grafana, and Jaeger

If enabled, FSM's Prometheus, Grafana, and Jaeger services are deployed alongside other FSM control plane components. Though these third party dependencies cannot be updated through the meshconfig like Pipy, the versions can still be updated in the deployment directly. For instance, to update prometheus to v2.19.1, the user can run:

```bash
export fsm_namespace=fsm-system # Replace fsm-system with the namespace where FSM is installed
kubectl set image deployment/fsm-prometheus -n $fsm_namespace prometheus="prom/prometheus:v2.19.1"
```

To update to Grafana 8.1.0, the command would look like:

```bash
kubectl set image deployment/fsm-grafana -n $fsm_namespace grafana="grafana/grafana:8.1.0"
```

And for Jaeger, the user would run the following to update to 1.26.0:

```bash
kubectl set image deployment/jaeger -n $fsm_namespace jaeger="jaegertracing/all-in-one:1.26.0"
```

## FSM Upgrade Troubleshooting Guide

#### FSM Mesh Upgrade Timing Out

### Insufficient CPU

If the `fsm mesh upgrade` command is timing out, it could be due to insufficient CPU.
1. Check the pods to see if any of them aren't fully up and running
```bash
# Replace fsm-system with fsm-controller's namespace if using a non-default namespace
kubectl get pods -n fsm-system
```
2. If there are any pods that are in Pending state, use `kubectl describe` to check the `Events` section
```bash
# Replace fsm-system with fsm-controller's namespace if using a non-default namespace
kubectl describe pod <pod-name> -n fsm-system
```

If you see the following error, then please increase the number of CPUs Docker can use.
```bash
`Warning  FailedScheduling  4s (x15 over 19m)  default-scheduler  0/1 nodes are available: 1 Insufficient cpu.`
```
#### Error Validating CLI Parameters

If the `fsm mesh upgrade` command is still timing out, it could be due to a CLI/Image Version mismatch.

1. Check the pods to see if any of them aren't fully up and running
```bash
# Replace fsm-system with fsm-controller's namespace if using a non-default namespace
kubectl get pods -n fsm-system
```
2. If there are any pods that are in Pending state, use `kubectl describe` to check the `Events` section for `Error Validating CLI parameters`
```bash
# Replace fsm-system with fsm-controller's namespace if using a non-default namespace
kubectl describe pod <pod-name> -n fsm-system
```
3. If you find the error, please check the pod's logs for any errors
```bash
kubectl logs -n fsm-system <pod-name> | grep -i error
```

If you see the following error, then it's due to a CLI/Image Version mismatch.
```bash
`"error":"Please specify the init container image using --init-container-image","reason":"FatalInvalidCLIParameters"`
```
Workaround is to set the `container-registry` and `fsm-image-tag` flag when running `fsm mesh upgrade`.
```bash
fsm mesh upgrade --container-registry $CTR_REGISTRY --fsm-image-tag $CTR_TAG --enable-egress=true
```

### Other Issues
If you're running into issues that are not resolved with the steps above, please [open a GitHub issue](https://github.com/flomesh-io/fsm/issues).
