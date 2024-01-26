# metrics-scraper

Small binary to scrape and store a small window of metrics from the Metrics Server in Kubernetes.

## Command-Line Arguments
| Flag  | Description  | Default  |
|---|---|---|
| kubeconfig  | The path to the kubeconfig used to connect to the Kubernetes API server and the Kubelets (defaults to in-cluster config)  |  |
| db-file  | What file to use as a SQLite3 database.  |  `/tmp/metrics.db` |
| metric-resolution | The resolution at which dashboard-metrics-scraper will poll metrics.  | `1m` |
| metric-duration | The duration after which metrics are purged from the database. | `15m` |
| log-level | The log level. | `info` |
| logtostderr | Log to standard error. | `true` |
| namespace | The namespace to use for all metric calls. When provided, skip node metrics. | defaults to cluster level metrics |


