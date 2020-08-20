// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
