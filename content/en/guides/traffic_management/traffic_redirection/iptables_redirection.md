---
title: "Iptables Redirection"
description: "Redirect traffic to sidecar proxy with iptables."
type: docs
weight: 1
---

FSM leverages [iptables](https://linux.die.net/man/8/iptables) to intercept and redirect traffic to and from pods participating in the service mesh to the Pipy proxy sidecar container running on each pod. Traffic redirected to the Pipy proxy sidecar is filtered and routed based on service mesh traffic policies.

> For more details of comparison between iptables and eBPF, you can refer to [Traffic Redirection](/guides/traffic_management/traffic_redirection/).

## How it works

FSM sidecar injector service `fsm-injector` injects an Pipy proxy sidecar on every pod created within the service mesh. Along with the Pipy proxy sidecar, `fsm-injector` also injects an [init container](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/), a specialized container that runs before any application containers in a pod. The injected init container is responsible for bootstrapping the application pods with traffic redirection rules such that all outbound TCP traffic from a pod and all inbound traffic TCP traffic to a pod are redirected to the pipy proxy sidecar running on that pod. This redirection is set up by the init container by running a set of `iptables` commands.

### Ports reserved for traffic redirection

FSM reserves a set of port numbers to perform traffic redirection and provide admin access to the Pipy proxy sidecar. It is essential to note that these port numbers must not be used by application containers running in the mesh. Using any of these reserved port numbers will lead to the Pipy proxy sidecar not functioning correctly.

Following are the port numbers that are reserved for use by FSM:

1. `15000`: used by the Pipy admin interface exposed over `localhost` to return current configuration files.
2. `15001`: used by the Pipy outbound listener to accept and proxy outbound traffic sent by applications within the pod
3. `15003`: used by the Pipy inbound listener to accept and proxy inbound traffic entering the pod destined to applications within the pod
4. `15010`: used by the Pipy inbound Prometheus listener to accept and proxy inbound traffic pertaining to scraping Pipy's Prometheus metrics
5. `15901`: used by Pipy to serve rewritten HTTP liveness probes
6. `15902`: used by Pipy to serve rewritten HTTP readiness probes
7. `15903`: used by Pipy to serve rewritten HTTP startup probes

The following are the port numbers that are reserved for use by FSM and allow traffic to bypass Pipy:

1. `15904`: used by `fsm-healthcheck` to serve `tcpSocket` health probes rewritten to `httpGet` health probes

### Application User ID (UID) reserved for traffic redirection

FSM reserves the user ID (UID) value `1500` for the Pipy proxy sidecar container. This user ID is of utmost importance while performing traffic interception and redirection to ensure the redirection does not result in a loop. The user ID value `1500` is used to program redirection rules to ensure redirected traffic from Pipy is not redirected back to itself!

Application containers must not used the reserved user ID value of `1500`.

### Types of traffic intercepted

Currently, FSM programs the Pipy proxy sidecar on each pod to only intercept inbound and outbound `TCP` traffic. This includes raw `TCP` traffic and any application traffic that uses `TCP` as the underlying transport protocol, such as `HTTP`, `gRPC` etc. This implies `UDP` and `ICMP` traffic which can be intercepted by `iptables` are not intercepted and redirected to the Pipy proxy sidecar.

### Iptables chains and rules

FSM's `fsm-injector` service programs the init container to set up a set of `iptables` chains and rules to perform traffic interception and redirection. The following section provides details on the responsibility of these chains and rules.

FSM leverages four chains to perform traffic interception and redirection:

1. `PROXY_INBOUND`: chain to intercept inbound traffic entering the pod
1. `PROXY_IN_REDIRECT`: chain to redirect intercepted inbound traffic to the sidecar proxy's inbound listener
1. `PROXY_OUTPUT`: chain to intercept outbound traffic from applications within the pod
1. `PROXY_REDIRECT`: chain to redirect intercepted outbound traffic to the sidecar proxy's outbound listener

Each of the chains above are programmed with rules to intercept and redirect application traffic via the Pipy proxy sidecar.

## Outbound IP range exclusions

Outbound TCP based traffic from applications is by default intercepted using the `iptables` rules programmed by FSM, and redirected to the Pipy proxy sidecar. In some cases, it might be desirable to not subject certain IP ranges to be redirected and routed by the Pipy proxy sidecar based on service mesh policies. A common use case to exclude IP ranges is to not route non-application logic based traffic via the Pipy proxy, such as traffic destined to the Kubernetes API server, or traffic destined to a cloud provider's instance metadata service. In such scenarios, excluding certain IP ranges from being subject to service mesh traffic routing policies becomes necessary.

Outbound IP ranges can be excluded at a global mesh scope or per pod scope.

### 1. Global outbound IP range exclusions

FSM provides the means to specify a global list of IP ranges to exclude from outbound traffic interception applicable to all pods in the mesh, as follows:

1. During FSM install using the `--set` option:

    ```bash
    # To exclude the IP ranges 1.1.1.1/32 and 2.2.2.2/24 from outbound interception
    fsm install --set=fsm.outboundIPRangeExclusionList="{1.1.1.1/32,2.2.2.2/24}"
    ```

1. By setting the `outboundIPRangeExclusionList` field in the `fsm-mesh-config` resource:

    ```bash
    ## Assumes FSM is installed in the fsm-system namespace
    kubectl patch meshconfig fsm-mesh-config -n fsm-system -p '{"spec":{"traffic":{"outboundIPRangeExclusionList":["1.1.1.1/32", "2.2.2.2/24"]}}}'  --type=merge
    ```

   When IP ranges are set for exclusion post-install, make sure to restart the pods in monitored namespaces for this change to take effect.

Globally excluded IP ranges are stored in the `fsm-mesh-config` `MeshConfig` custom resource and are read at the time of sidecar injection by `fsm-injector`. These dynamically configurable IP ranges are programmed by the init container along with the static rules used to intercept and redirect traffic via the Pipy proxy sidecar. Excluded IP ranges will not be intercepted for traffic redirection to the Pipy proxy sidecar. Refer to the [outbound IP range exclusion demo](/demos/traffic_management/outbound_ip_exclusion) to learn more.

### 2. Pod scoped outbound IP range exclusions

Outbound IP range exclusions can be configured at pod scope by annotating the pod to specify a comma separated list of IP CIDR ranges as `flomesh.io/outbound-ip-range-exclusion-list=<comma separated list of IP CIDRs>`.

```bash
# To exclude the IP ranges 10.244.0.0/16 and 10.96.0.0/16 from outbound interception on the pod
kubectl annotate pod <pod> flomesh.io/outbound-ip-range-exclusion-list="10.244.0.0/16,10.96.0.0/16"
```

When IP ranges are annotated post pod creation, make sure to restart the corresponding pods for this change to take effect.

## Outbound IP range inclusions

Outbound TCP based traffic from applications is by default intercepted using the `iptables` rules programmed by FSM, and redirected to the Pipy proxy sidecar. In some cases, it might be desirable to only subject certain IP ranges to be redirected and routed by the Pipy proxy sidecar based on service mesh policies, and have remaining traffic not proxied to the sidecar. In such scenarios, inclusion IP ranges can be specified.

Outbound inclusion IP ranges can be specified at a global mesh scope or per pod scope.

### 1. Global outbound IP range inclusions

FSM provides the means to specify a global list of IP ranges to include for outbound traffic interception applicable to all pods in the mesh, as follows:

1. During FSM install using the `--set` option:

    ```bash
    # To include the IP ranges 1.1.1.1/32 and 2.2.2.2/24 for outbound interception
    fsm install --set=fsm.outboundIPRangeInclusionList="[1.1.1.1/32,2.2.2.2/24]"
    ```

1. By setting the `outboundIPRangeInclusionList` field in the `fsm-mesh-config` resource:

    ```bash
    ## Assumes FSM is installed in the fsm-system namespace
    kubectl patch meshconfig fsm-mesh-config -n fsm-system -p '{"spec":{"traffic":{"outboundIPRangeInclusionList":["1.1.1.1/32", "2.2.2.2/24"]}}}'  --type=merge
    ```

   When IP ranges are set for inclusion post-install, make sure to restart the pods in monitored namespaces for this change to take effect.

Globally included IP ranges are stored in the `fsm-mesh-config` `MeshConfig` custom resource and are read at the time of sidecar injection by `fsm-injector`. These dynamically configurable IP ranges are programmed by the init container along with the static rules used to intercept and redirect traffic via the Pipy proxy sidecar. IP addresses outside the specified inclusion IP ranges will not be intercepted for traffic redirection to the Pipy proxy sidecar.

### 2. Pod scoped outbound IP range inclusions

Outbound IP range inclusions can be configured at pod scope by annotating the pod to specify a comma separated list of IP CIDR ranges as `flomesh.io/outbound-ip-range-inclusion-list=<comma separated list of IP CIDRs>`.

```bash
# To include the IP ranges 10.244.0.0/16 and 10.96.0.0/16 for outbound interception on the pod
kubectl annotate pod <pod> flomesh.io/outbound-ip-range-inclusion-list="10.244.0.0/16,10.96.0.0/16"
```

When IP ranges are annotated post pod creation, make sure to restart the corresponding pods for this change to take effect.

## Outbound port exclusions

Outbound TCP based traffic from applications is by default intercepted using the `iptables` rules programmed by FSM, and redirected to the Pipy proxy sidecar. In some cases, it might be desirable to not subject certain ports to be redirected and routed by the Pipy proxy sidecar based on service mesh policies. A common use case to exclude ports is to not route non-application logic based traffic via the Pipy proxy, such as control plane traffic. In such scenarios, excluding certain ports from being subject to service mesh traffic routing policies becomes necessary.

Outbound ports can be excluded at a global mesh scope or per pod scope.

### 1. Global outbound port exclusions

FSM provides the means to specify a global list of ports to exclude from outbound traffic interception applicable to all pods in the mesh, as follows:

1. During FSM install using the `--set` option:

    ```bash
    # To exclude the ports 6379 and 7070 from outbound sidecar interception
    fsm install --set=fsm.outboundPortExclusionList="{6379,7070}"
    ```

1. By setting the `outboundPortExclusionList` field in the `fsm-mesh-config` resource:

    ```bash
    ## Assumes FSM is installed in the fsm-system namespace
    kubectl patch meshconfig fsm-mesh-config -n fsm-system -p '{"spec":{"traffic":{"outboundPortExclusionList":[6379, 7070]}}}'  --type=merge
    ```

   When ports are set for exclusion post-install, make sure to restart the pods in monitored namespaces for this change to take effect.

Globally excluded ports are are stored in the `fsm-mesh-config` `MeshConfig` custom resource and are read at the time of sidecar injection by `fsm-injector`. These dynamically configurable ports are programmed by the init container along with the static rules used to intercept and redirect traffic via the Pipy proxy sidecar. Excluded ports will not be intercepted for traffic redirection to the Pipy proxy sidecar.

### 2. Pod scoped outbound port exclusions

Outbound port exclusions can be configured at pod scope by annotating the pod with a comma separated list of ports as `flomesh.io/outbound-port-exclusion-list=<comma separated list of ports>`:

```bash
# To exclude the ports 6379 and 7070 from outbound interception on the pod
kubectl annotate pod <pod> flomesh.io/outbound-port-exclusion-list=6379,7070
```

When ports are annotated post pod creation, make sure to restart the corresponding pods for this change to take effect.

## Inbound port exclusions

Similar to outbound port exclusions described above, inbound traffic on pods can be excluded from being proxied to the sidecar based on the ports the traffic is directed to.

### 1. Global inbound port exclusions

FSM provides the means to specify a global list of ports to exclude from inbound traffic interception applicable to all pods in the mesh, as follows:

1. During FSM install using the `--set` option:

    ```bash
    # To exclude the ports 6379 and 7070 from inbound sidecar interception
    fsm install --set=fsm.inboundPortExclusionList="[6379,7070]"
    ```

1. By setting the `inboundPortExclusionList` field in the `fsm-mesh-config` resource:

    ```bash
    ## Assumes FSM is installed in the fsm-system namespace
    kubectl patch meshconfig fsm-mesh-config -n fsm-system -p '{"spec":{"traffic":{"inboundPortExclusionList":[6379, 7070]}}}'  --type=merge
    ```

   When ports are set for exclusion post-install, make sure to restart the pods in monitored namespaces for this change to take effect.

### 2. Pod scoped inbound port exclusions

Inbound port exclusions can be configured at pod scope by annotating the pod with a comma separated list of ports as `flomesh.io/inbound-port-exclusion-list=<comma separated list of ports>`:

```bash
# To exclude the ports 6379 and 7070 from inbound sidecar interception on the pod
kubectl annotate pod <pod> flomesh.io/inbound-port-exclusion-list=6379,7070
```

When ports are annotated post pod creation, make sure to restart the corresponding pods for this change to take effect.
