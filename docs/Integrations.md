Currently only [Heapster](https://github.com/kubernetes/heapster) integration is supported, however there are plans to introduce integration framework to Dashboard. It will allow to support and integrate more metric providers as well as additional applications such as [Weave Scope](https://github.com/weaveworks/scope) or [Grafana](https://github.com/grafana/grafana).

## Metric integrations

Metric integrations allow Dashboard to show cpu/memory usage graphs and sparklines of resources running inside the cluster. In order to make Dashboard resilient to metric provider crashes there was `--metric-client-check-period` flag introduced. By default every 30 seconds health of the metric provider will be checked and in case it crashes metrics will be disabled.

### Heapster

For the sparklines and graphs to be shown in Dashboard you need to have [Heapster](https://github.com/kubernetes/heapster/) running on your cluster. We require heapster to be deployed in `kube-system` namespace together with service named `heapster`. In case heapster is not accessible from inside the cluster you can provide heapster url as a flag to Dashboard container `--heapster-host=<heapster_url>`.

**NOTE:** Currently `--heapster-host` flag does not support HTTPS connection. Only HTTP urls should be used.