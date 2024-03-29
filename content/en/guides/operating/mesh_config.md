---
title: "Mesh configuration"
description: "FSM MeshConfig"
type: docs
aliases: ["/docs/fsm_mesh_config/"]
weight: 7
---

FSM deploys a MeshConfig resource `fsm-mesh-config` as a part of its control plane (in the same namespace as that of the fsm-controller pod) which can be updated by the mesh owner/operator at any time. The purpose of this MeshConfig is to provide the mesh owner/operator the ability to update some of the mesh configurations based on their needs.

At the time of install, the FSM MeshConfig is deployed from a preset MeshConfig (`preset-mesh-config`) which can be found under [charts/fsm/templates](https://github.com/flomesh-io/fsm/blob/{{< param fsm_branch >}}/charts/fsm/templates/preset-mesh-config.yaml).

First, set an environment variable to refer to the namespace where fsm was installed.

```bash
export FSM_NAMESPACE=fsm-system # Replace fsm-system with the namespace where FSM is installed
```

To view your `fsm-mesh-config` in CLI use the `kubectl get` command.

```bash
kubectl get meshconfig fsm-mesh-config -n "$FSM_NAMESPACE" -o yaml
```

*Note: Values in the MeshConfig `fsm-mesh-config` are persisted across upgrades.*

## Configure FSM MeshConfig

### Kubectl Patch Command

Changes to `fsm-mesh-config` can be made using the `kubectl patch` command.

```bash
kubectl patch meshconfig fsm-mesh-config -n "$FSM_NAMESPACE" -p '{"spec":{"traffic":{"enableEgress":true}}}'  --type=merge
```

Refer to the [Config API reference](/api_reference/config/v1alpha1) for more information.

If an incorrect value is used, validations on the [MeshConfig CRD](https://github.com/flomesh-io/fsm/blob/{{< param fsm_branch >}}/cmd/fsm-bootstrap/crds/config_meshconfig.yaml) will prevent the change with an error message explaining why the value is invalid.

For example, the below command shows what happens if we patch `enableEgress` to a non-boolean value.

```bash
kubectl patch meshconfig fsm-mesh-config -n "$FSM_NAMESPACE" -p '{"spec":{"traffic":{"enableEgress":"no"}}}'  --type=merge
# Validations on the CRD will deny this change
The MeshConfig "fsm-mesh-config" is invalid: spec.traffic.enableEgress: Invalid value: "string": spec.traffic.enableEgress in body must be of type boolean: "string"
```

#### Kubectl Patch Command for Each Key Type

> Note: `<fsm-namespace>` refers to the namespace where the fsm control plane is installed. By default, the fsm namespace is `fsm-system`.

| Key                                            | Type   | Default Value                                | Kubectl Patch Command Examples                                                                                                                                                 |
| ---------------------------------------------- | ------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| spec.traffic.enableEgress                      | bool   | `false`                                      | `kubectl patch meshconfig fsm-mesh-config -n $FSM_NAMESPACE -p '{"spec":{"traffic":{"enableEgress":true}}}'  --type=merge`                                                     |
| spec.traffic.enablePermissiveTrafficPolicyMode | bool   | `false`                                      | `kubectl patch meshconfig fsm-mesh-config -n $FSM_NAMESPACE -p '{"spec":{"traffic":{"enablePermissiveTrafficPolicyMode":true}}}'  --type=merge`                                |
| spec.traffic.useHTTPSIngress                   | bool   | `false`                                      | `kubectl patch meshconfig fsm-mesh-config -n $FSM_NAMESPACE -p '{"spec":{"traffic":{"useHTTPSIngress":true}}}'  --type=merge`                                                  |
| spec.traffic.outboundPortExclusionList         | array  | `[]`                                         | `kubectl patch meshconfig fsm-mesh-config -n $FSM_NAMESPACE -p '{"spec":{"traffic":{"outboundPortExclusionList":6379,8080}}}'  --type=merge`                                   |
| spec.traffic.outboundIPRangeExclusionList      | array  | `[]`                                         | `kubectl patch meshconfig fsm-mesh-config -n $FSM_NAMESPACE -p '{"spec":{"traffic":{"outboundIPRangeExclusionList":"10.0.0.0/32,1.1.1.1/24"}}}'  --type=merge`                 |
| spec.certificate.serviceCertValidityDuration   | string | `"24h"`                                      | `kubectl patch meshconfig fsm-mesh-config -n $FSM_NAMESPACE -p '{"spec":{"certificate":{"serviceCertValidityDuration":"24h"}}}'  --type=merge`                                 |
| spec.observability.enableDebugServer           | bool   | `false`                                      | `kubectl patch meshconfig fsm-mesh-config -n $FSM_NAMESPACE -p '{"spec":{"observability":{"serviceCertValidityDuration":true}}}'  --type=merge`                                |
| spec.observability.tracing.enable              | bool   | `"jaeger.<fsm-namespace>.svc.cluster.local"` | `kubectl patch meshconfig fsm-mesh-config -n $FSM_NAMESPACE -p '{"spec":{"observability":{"tracing":{"address": "jaeger.<fsm-namespace>.svc.cluster.local"}}}}'  --type=merge` |
| spec.observability.tracing.address             | string | `"/api/v2/spans"`                            | `kubectl patch meshconfig fsm-mesh-config -n $FSM_NAMESPACE -p '{"spec":{"observability":{"tracing":{"endpoint":"/api/v2/spans"}}}}'  --type=merge' --type=merge`              |
| spec.observability.tracing.endpoint            | string | `false`                                      | `kubectl patch meshconfig fsm-mesh-config -n $FSM_NAMESPACE -p '{"spec":{"observability":{"tracing":{"enable":true}}}}'  --type=merge`                                         |
| spec.observability.tracing.port                | int    | `9411`                                       | `kubectl patch meshconfig fsm-mesh-config -n $FSM_NAMESPACE -p '{"spec":{"observability":{"tracing":{"port":9411}}}}'  --type=merge`                                           |
| spec.sidecar.enablePrivilegedInitContainer     | bool   | `false`                                      | `kubectl patch meshconfig fsm-mesh-config -n $FSM_NAMESPACE -p '{"spec":{"sidecar":{"enablePrivilegedInitContainer":true}}}'  --type=merge`                                    |
| spec.sidecar.logLevel                          | string | `"error"`                                    | `kubectl patch meshconfig fsm-mesh-config -n $FSM_NAMESPACE -p '{"spec":{"sidecar":{"logLevel":"error"}}}'  --type=merge`                                                      |
| spec.sidecar.maxDataPlaneConnections           | int    | `0`                                          | `kubectl patch meshconfig fsm-mesh-config -n $FSM_NAMESPACE -p '{"spec":{"sidecar":{"maxDataPlaneConnections":"error"}}}'  --type=merge`                                       |
| spec.sidecar.configResyncInterval              | string | `"0s"`                                       | `kubectl patch meshconfig fsm-mesh-config -n $FSM_NAMESPACE -p '{"spec":{"sidecar":{"configResyncInterval":"30s"}}}'  --type=merge`                                            |
