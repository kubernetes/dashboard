# Integrations

Currently Dashboard implements [metrics-server](https://github.com/kubernetes-sigs/metrics-server) and [Heapster](https://github.com/kubernetes/heapster) integrations. They are using [integration framework](../../src/app/backend/integration/manager.go) that allows to support and integrate more metric providers as well as additional applications such as [Weave Scope](https://github.com/weaveworks/scope) or [Grafana](https://github.com/grafana/grafana).

## Metric integrations

Metric integrations allow Dashboard to show cpu/memory usage graphs and sparklines of resources running inside the cluster. In order to make Dashboard resilient to metric provider crashes there was `--metric-client-check-period` flag introduced. By default every 30 seconds health of the metric provider will be checked and in case it crashes metrics will be disabled.

### metrics-server

For the sparklines and graphs to be shown in Dashboard you need to have [metrics-server](https://github.com/kubernetes-sigs/metrics-server) running in your cluster. It now uses [dashboard-metrics-scraper](https://github.com/kubernetes-sigs/dashboard-metrics-scraper) that is deployed by default with Kubernetes Dashboard. It uses the Metrics API to gather metrics.
The easiest way to check if `metrics-server` is installed and working properly is to run `kubectl top pod` or `kubectl top node`.

### Heapster

Starting from Kubernetes Dashboard v2.0.0 Heapster is no longer maintained. Use [metrics-server](#metrics-server) integration to enable metrics.

----
_Copyright 2019 [The Kubernetes Dashboard Authors](https://github.com/kubernetes/dashboard/graphs/contributors)_
