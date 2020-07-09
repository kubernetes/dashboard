package options

import cliflag "k8s.io/component-base/cli/flag"

type MetricsRunOptions struct {
  MetricsProvider string
  MetricClientCheckPeriod int
  SidecarHost string
}

func (s *MetricsRunOptions) Flags() (fss cliflag.NamedFlagSets) {
  fs := fss.FlagSet("metrics")
  fs.StringVar(&s.MetricsProvider, "metrics-provider", s.MetricsProvider, "Select provider type for metrics. 'none' will not check metrics.")
  fs.StringVar(&s.SidecarHost, "sidecar-host", s.SidecarHost, "The address of the Sidecar Apiserver "+
    "to connect to in the format of protocol://address:port, e.g., "+
    "http://localhost:8000. If not specified, the assumption is that the binary runs inside a "+
    "Kubernetes cluster and service proxy will be used.")
  fs.IntVar(&s.MetricClientCheckPeriod, "metric-client-check-period", s.MetricClientCheckPeriod, "Time in seconds that defines how often configured metric client health check should be run.")

  return fss
}

func NewMetricsRunOptions() *MetricsRunOptions {
  return &MetricsRunOptions{
    MetricsProvider:         "sidecar",
    MetricClientCheckPeriod: 30,
  }
}
