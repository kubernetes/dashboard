package args

import (
	"flag"
	"time"

	"github.com/spf13/pflag"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/helpers"
)

// TODO export to common package
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
	argKubeconfig       = pflag.String("kubeconfig", "", "The path to the kubeconfig used to connect to the Kubernetes API server and the Kubelets (defaults to in-cluster config)")
	argDBFile           = pflag.String("db-file", "/tmp/metrics.db", "What file to use as a SQLite3 database.")
	argMetricResolution = pflag.Duration("metric-resolution", 1*time.Minute, "The resolution at which dashboard-metrics-scraper will poll metrics.")
	argMetricDuration   = pflag.Duration("metric-duration", 15*time.Minute, "The duration after which metrics are purged from the database.")
	// When running in a scoped namespace, disable Node lookup and only capture metrics for the given namespace(s)
	argMetricNamespaces = pflag.StringSlice("namespaces", []string{helpers.GetEnv("POD_NAMESPACE", "")}, "The namespaces to use for all metric calls. When provided, skip node metrics. (defaults to cluster level metrics)")
)

func init() {
	// Init klog
	fs := flag.NewFlagSet("", flag.PanicOnError)
	klog.InitFlags(fs)

	// Default log level to 1
	_ = fs.Set("v", "1")

	pflag.CommandLine.AddGoFlagSet(fs)
	pflag.Parse()
}

func KubeconfigPath() string {
	return *argKubeconfig
}

func DBFile() string {
	return *argDBFile
}

func MetricResolution() time.Duration {
	return *argMetricResolution
}

func MetricDuration() time.Duration {
	return *argMetricDuration
}

func MetricNamespaces() []string {
	return *argMetricNamespaces
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
