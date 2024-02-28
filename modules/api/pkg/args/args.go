package args

import (
	"flag"
	"fmt"
	"net"

	"github.com/spf13/pflag"
	"k8s.io/klog/v2"

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

var (
	argInsecurePort             = pflag.Int("insecure-port", 8000, "port to listen to for incoming HTTP requests")
	argPort                     = pflag.Int("port", 8001, "secure port to listen to for incoming HTTPS requests")
	argInsecureBindAddress      = pflag.IP("insecure-bind-address", net.IPv4(127, 0, 0, 1), "IP address on which to serve the --insecure-port, set to 127.0.0.1 for all interfaces")
	argBindAddress              = pflag.IP("bind-address", net.IPv4(0, 0, 0, 0), "IP address on which to serve the --port, set to 0.0.0.0 for all interfaces")
	argDefaultCertDir           = pflag.String("default-cert-dir", "/certs", "directory path containing files from --tls-cert-file and --tls-key-file, used also when auto-generating certificates flag is set")
	argCertFile                 = pflag.String("tls-cert-file", "", "file containing the default x509 certificate for HTTPS")
	argKeyFile                  = pflag.String("tls-key-file", "", "file containing the default x509 private key matching --tls-cert-file")
	argApiServerHost            = pflag.String("apiserver-host", "", "address of the Kubernetes API server to connect to in the format of protocol://address:port, leave it empty if the binary runs inside cluster for local discovery attempt")
	argApiServerSkipTLSVerify   = pflag.Bool("apiserver-skip-tls-verify", false, "enable if connection with remote Kubernetes API server should skip TLS verify")
	argMetricsProvider          = pflag.String("metrics-provider", "sidecar", "select provider type for metrics, 'none' will not check metrics")
	argSidecarHost              = pflag.String("sidecar-host", "", "address of the Sidecar API server to connect to in the format of protocol://address:port, leave it empty if the binary runs inside cluster for service proxy usage")
	argKubeConfigFile           = pflag.String("kubeconfig", "", "path to kubeconfig file with authorization and control plane location information")
	argMetricClientCheckPeriod  = pflag.Int("metric-client-check-period", 30, "time interval between separate metric client health checks in seconds")
	argAutoGenerateCertificates = pflag.Bool("auto-generate-certificates", false, "enables automatic certificates generation used to serve HTTPS")
	argNamespace                = pflag.String("namespace", helpers.GetEnv("POD_NAMESPACE", "kube-system"), "if non-default namespace is used encryption key will be created in the specified namespace")
	argEnableCSRFProtection     = pflag.Bool("enable-csrf-protection", true, "enabled CSRF protection and makes sure that every non-idempotent action contains a valid CSRF token")
)

func init() {
	// Init klog
	fs := flag.NewFlagSet("", flag.PanicOnError)
	klog.InitFlags(fs)

	// Default log level to 1
	_ = fs.Set("v", "1")

	pflag.CommandLine.AddGoFlagSet(fs)
	pflag.Parse()

	klog.Infof("Using namespace: %s", Namespace())
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

	level := new(klog.Level)
	if err := level.Set(v.Value.String()); err != nil {
		klog.ErrorS(err, "Could not parse log level", "level", v.Value.String())
		return LogLevelDefault
	}

	return LogLevelDefault
}

func Namespace() string {
	return *argNamespace
}

func IsCSRFProtectionEnabled() bool {
	return *argEnableCSRFProtection
}
