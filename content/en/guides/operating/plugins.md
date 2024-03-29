---
title: "Extending FSM"
description: "How to extend FSM service mesh without re-compiling it"
type: docs
weight: 15
---

# Extending FSM with `Plugin` Interface

In the latest 1.3.0 version of Flomesh service mesh FSM, we have introduced a significant feature: `Plugin`. This feature aims to provide developers with a way to extend the functionality of the service mesh without changing the FSM itself.

Nowadays, service mesh seems to be developing in two directions. One is like `Istio`, which provides a lot of ready-to-use functions and is very rich in features. The other like `Linkerd`, Flomesh `FSM`, and others that uphold the principle of simplicity and provide a minimum functional set that meets the user's needs. There is no superiority or inferiority between the two: the former is rich in features but inevitably has the additional overhead of proxy, not only in resource consumption but also in the cost of learning and maintenance; the latter is easy to learn and use, consumes fewer resources, but the provided functions might not be enough for the immediate need of user desired functionality.

It is not difficult to imagine that the ideal solution is the low cost of the minimum functional set + the flexibility of scalability. The core of the service mesh is in the data plane, and the flexibility of scalability requires a high demand for the physique of the sidecar proxy. This is also why the Flomesh service mesh chose programmable proxy [Pipy](https://flomesh.io/pipy) as the sidecar proxy.

Pipy is a programmable network proxy for cloud, edge, and IoT. It is flexible, fast, small, programmable, and open-source. The modular design of Pipy provides a large number of reusable filters that can be assembled into pipelines to process network data. Pipy provides a set of api and small usable filters to achieve business objectives while hiding the underlying details. Additionally, Pipy scripts (programming code that implements functional logic) can be dynamically delivered to Pipy instances over the network, enabling the proxy to be extended with new features without the need for compilation or restart.

## Flomesh FSM extension solution

FSM provides three new CRDs for extensibility:

- `Plugin`: The plugin contains the code logic for the new functionality. The default functions provided by FSM are also available as plugins, but not in the form of a `Plugin` resource. These plugins can be adjusted through the Helm values file when installing FSM. For more information, refer to the built-in plugin list in the Helm [values.yaml](https://github.com/flomesh-io/fsm/blob/45b05bd39dc0e8d1c28460622a4be2f92abdf28f/charts/fsm/values.yaml#L84) file.
- `PluginChain`: The plugin chain is the execution of plugins in sequence. The system provides four plugin chains: `inbound-tcp`, `inbound-http`, `outbound-tcp`, `outbound-http`. They correspond to the OSI layer-4 and layer-7 processing stages of inbound and outbound traffic, respectively.
- `PluginConfig`: The plugin configuration provides the configuration required for the plugin logic to run, which will be sent to the FSM sidecar proxy in JSON format.

For detailed information on plugin CRDs, refer to the [Plugin API document](/api_reference/plugin/).

### Built-in variables

Below is a list of `built-in` PipyJS variables which can be imported into your custom plugins via PipyJS [import](https://flomesh.io/pipy/docs/en/reference/api/Configuration/import) keyword.

| variable        | type    | namespace                                          | suited for Chains                     | description                          |
| ----------- | ------- | --------------------------------------------- | ----------------------------- | --------------------------- |
| __protocol  | string  | inbound                                       | inbound-http / inbound-tcp    | connection protocol indicator                         |
| __port      | json    | inbound                                       | inbound-http / inbound-tcp    | port of inbound endpoint         |
| __isHTTP2   | boolean | inbound                                       | inbound-http                  | whether protocol is HTTP/2               |
| __isIngress | boolean | inbound                                       | inbound-http                  | Ingress mode enabled              |
| __target    | string  | inbound/connect-tcp                           | inbound-http / inbound-tcp    | Destination upstream                      |
| __plugins   | json    | inbound                                       | inbound-http / inbound-tcp    | JSON object of inbound plugins     |
| __service   | json    | inbound-http-routing                          | inbound-http                  | http service json object            |
| __route     | json    | inbound-http-routing                          | inbound-http                  | http route json object            |
| __cluster   | json    | inbound-http-routing<br>inbound-tcp-rouging   | inbound-http<br>inbound-tcp   | target cluster json object |
| __protocol  | string  | outbound                                      | outbound-http / outbound-tcp  | outbound connection protocol                        |
| __port      | json    | outbound                                      | outbound-http / outbound-tcp  | outbound port json object        |
| __isHTTP2   | boolean | outbound                                      | outbound-http                 | whether protocol is HTTP/2               |
| __isEgress  | boolean | outbound                                      | outbound-tcp                  | Egress mode               |
| __target    | string  | outbound/                                     | outbound-http / outbound-tcp  | Upstream target                      |
| __plugins   | json    | outbound                                      | outbound-http / outbound-tcp  | outbound plugin json object    |
| __service   | json    | outbound-http-routing                         | outbound-http                 | http service json object            |
| __route     | json    | outbound-http-routing                         | outbound-http                 | http route json object           |
| __cluster   | json    | outbound-http-routing<br>outbound-tcp-routing | outbound-http<br>outbound-tcp | target cluster json object |


## Demo

For a simple demonstration of how to extend FSM via `Plugins`, refer to below demo:

* [Adding Identity and Access Management functionality](/demos/plugins/plugin_iam_demo)