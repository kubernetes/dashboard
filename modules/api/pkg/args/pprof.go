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
