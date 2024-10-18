package args

import (
	"fmt"
	"net/http"

	"github.com/prometheus/client_golang/prometheus/promhttp"
	"k8s.io/klog/v2"
)

func initPrometheus() {
	klog.V(LogLevelInfo).Info("Initializing prometheus metrics")

	mux := http.NewServeMux()
	mux.Handle(defaultPrometheusPath, promhttp.Handler())
	go func() {
		if err := http.ListenAndServe(fmt.Sprintf(":%d", defaultPrometheusPort), mux); err != nil {
			klog.Fatal(err)
		}
	}()
}
