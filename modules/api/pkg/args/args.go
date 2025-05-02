// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package args

import (
	"flag"
	"fmt"
	"net"
	"strconv"

	"github.com/spf13/pflag"
	"k8s.io/klog/v2"

	// Load client args
	_ "k8s.io/dashboard/client/args"
	"k8s.io/dashboard/csrf"
	"k8s.io/dashboard/helpers"
)

const (
	LogLevelDefault  = klog.Level(0)
	LogLevelMinimal  = LogLevelDefault
	LogLevelInfo     = klog.Level(1)
	LogLevelVerbose  = klog.Level(2)
	LogLevelExtended = klog.Level(3)
	LogLevelDebug    = klog.Level(4)
	LogLevelTrace    = klog.Level(5)
)

const (
	defaultInsecurePort   = 8000
	defaultPort           = 8001
	defaultProfilerPort   = 8070
	defaultPrometheusPort = 8080

	defaultProfilerPath   = "/debug/pprof/"
	defaultPrometheusPath = "/metrics"
)

var (
	argDisableCSRFProtection    = pflag.Bool("disable-csrf-protection", false, "allows disabling CSRF protection")
	argIsProxyEnabled           = pflag.Bool("act-as-proxy", false, "forces dashboard to work in full proxy mode, meaning that any in-cluster calls are disabled")
	argOpenAPIEnabled           = pflag.Bool("openapi-enabled", false, "enables OpenAPI v2 endpoint under '/apidocs.json'")
	argProfiler                 = pflag.Bool("profiler", false, "Enable pprof handler. By default it will be exposed on localhost:8070 under '/debug/pprof'")
	argPrometheusEnabled        = pflag.Bool("prometheus-enabled", false, "Enable prometheus metrics handler. By default it will be exposed on localhost:8080 under '/metrics'")
	argApiServerSkipTLSVerify   = pflag.Bool("apiserver-skip-tls-verify", false, "enable if connection with remote Kubernetes API server should skip TLS verify")
	argAutoGenerateCertificates = pflag.Bool("auto-generate-certificates", false, "enables automatic certificates generation used to serve HTTPS")

	argInsecurePort            = pflag.Int("insecure-port", defaultInsecurePort, "port to listen to for incoming HTTP requests")
	argPort                    = pflag.Int("port", defaultPort, "secure port to listen to for incoming HTTPS requests")
	argMetricClientCheckPeriod = pflag.Int("metric-client-check-period", 30, "time interval between separate metric client health checks in seconds")

	argInsecureBindAddress = pflag.IP("insecure-bind-address", net.IPv4(127, 0, 0, 1), "IP address on which to serve the --insecure-port, set to 0.0.0.0 for all interfaces")
	argBindAddress         = pflag.IP("bind-address", net.IPv4(0, 0, 0, 0), "IP address on which to serve the --port, set to 0.0.0.0 for all interfaces")

	argDefaultCertDir            = pflag.String("default-cert-dir", "/certs", "directory path containing files from --tls-cert-file and --tls-key-file, used also when auto-generating certificates flag is set")
	argCertFile                  = pflag.String("tls-cert-file", "", "file containing the default x509 certificate for HTTPS")
	argKeyFile                   = pflag.String("tls-key-file", "", "file containing the default x509 private key matching --tls-cert-file")
	argApiServerHost             = pflag.String("apiserver-host", "", "address of the Kubernetes API server to connect to in the format of protocol://address:port, leave it empty if the binary runs inside cluster for local discovery attempt")
	argMetricsProvider           = pflag.String("metrics-provider", "sidecar", "select provider type for metrics, 'none' will not check metrics")
	argSidecarHost               = pflag.String("sidecar-host", "", "address of the Sidecar API server to connect to in the format of protocol://address:port, leave it empty if the binary runs inside cluster for service proxy usage")
	argKubeConfigFile            = pflag.String("kubeconfig", "", "path to kubeconfig file with control plane location information")
	argNamespace                 = pflag.String("namespace", helpers.GetEnv("POD_NAMESPACE", "kubernetes-dashboard"), "Namespace to use when accessing Dashboard specific resources, i.e. metrics scraper service")
	argMetricsScraperServiceName = pflag.String("metrics-scraper-service-name", "kubernetes-dashboard-metrics-scraper", "name of the dashboard metrics scraper service")
)

func init() {
	// Init klog
	fs := flag.NewFlagSet("", flag.PanicOnError)
	klog.InitFlags(fs)

	// Default log level to 1
	_ = fs.Set("v", "1")

	pflag.CommandLine.AddGoFlagSet(fs)
	pflag.Parse()

	if IsCSRFProtectionEnabled() {
		csrf.Ensure()
	}

	if *argProfiler {
		initProfiler()
	}

	if *argPrometheusEnabled {
		initPrometheus()
	}
}

func Address() string {
	return fmt.Sprintf("%s:%d", *argBindAddress, *argPort)
}

func InsecureAddress() string {
	return fmt.Sprintf("%s:%d", *argInsecureBindAddress, *argInsecurePort)
}

func DefaultCertDir() string {
	return *argDefaultCertDir
}

func CertFile() string {
	return *argCertFile
}

func KeyFile() string {
	return *argKeyFile
}

func ApiServerHost() string {
	return *argApiServerHost
}

func ApiServerSkipTLSVerify() bool {
	return *argApiServerSkipTLSVerify
}

func MetricsProvider() string {
	return *argMetricsProvider
}

func SidecarHost() string {
	return *argSidecarHost
}

func KubeconfigPath() string {
	return *argKubeConfigFile
}

func MetricClientHealthCheckPeriod() int {
	return *argMetricClientCheckPeriod
}

func AutogenerateCertificates() bool {
	return *argAutoGenerateCertificates
}

func APILogLevel() klog.Level {
	v := pflag.Lookup("v")
	if v == nil {
		return LogLevelDefault
	}

	level, err := strconv.ParseInt(v.Value.String(), 10, 32)
	if err != nil {
		klog.ErrorS(err, "Could not parse log level", "level", v.Value.String())
		return LogLevelDefault
	}

	return klog.Level(level)
}

func MetricsScraperServiceName() string {
	return *argMetricsScraperServiceName
}

func Namespace() string {
	return *argNamespace
}

func IsCSRFProtectionEnabled() bool {
	return !*argDisableCSRFProtection
}

func IsProxyEnabled() bool {
	return *argIsProxyEnabled
}

func IsOpenAPIEnabled() bool {
	return *argOpenAPIEnabled
}
