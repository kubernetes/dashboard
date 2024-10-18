package args

import (
	"fmt"
	"net/http"
	"net/http/pprof"

	"k8s.io/klog/v2"
)

func initProfiler() {
	klog.V(LogLevelInfo).Info("Initializing profiler")

	mux := http.NewServeMux()
	mux.HandleFunc(defaultProfilerPath, pprof.Index)
	go func() {
		if err := http.ListenAndServe(fmt.Sprintf(":%d", defaultProfilerPort), mux); err != nil {
			klog.Fatal(err)
		}
	}()
}
