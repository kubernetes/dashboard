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

	"github.com/spf13/pflag"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/csrf"
)

var (
	argPort       = pflag.Int("port", 8000, "The port for auth service to listen on.")
	argAddress    = pflag.IP("address", net.IPv4(0, 0, 0, 0), "The IP address for auth service to serve on. Set 0.0.0.0 for listening on all interfaces.")
	argKubeconfig = pflag.String("kubeconfig", "", "path to kubeconfig file")
)

func init() {
	// Init klog
	fs := flag.NewFlagSet("", flag.PanicOnError)
	klog.InitFlags(fs)

	// Default log level to 1
	_ = fs.Set("v", "1")

	pflag.CommandLine.AddGoFlagSet(fs)
	pflag.Parse()

	csrf.Ensure()
}

func KubeconfigPath() string {
	return *argKubeconfig
}

func Address() string {
	return fmt.Sprintf("%s:%d", *argAddress, *argPort)
}
