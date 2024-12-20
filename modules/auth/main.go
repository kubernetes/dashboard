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

package main

import (
	"os"

	"k8s.io/klog/v2"

	"k8s.io/dashboard/auth/pkg/args"
	"k8s.io/dashboard/auth/pkg/environment"
	"k8s.io/dashboard/auth/pkg/router"
	"k8s.io/dashboard/client"

	// Importing route packages forces route registration
	_ "k8s.io/dashboard/auth/pkg/routes/csrftoken"
	_ "k8s.io/dashboard/auth/pkg/routes/login"
	_ "k8s.io/dashboard/auth/pkg/routes/me"
)

func main() {
	klog.InfoS("Starting Kubernetes Dashboard Auth", "version", environment.Version)

	client.Init(
		client.WithUserAgent(environment.UserAgent()),
		client.WithKubeconfig(args.KubeconfigPath()),
		client.WithMasterUrl(args.ApiServerHost()),
		client.WithInsecureTLSSkipVerify(args.ApiServerSkipTLSVerify()),
	)

	klog.V(1).InfoS("Listening and serving insecurely on", "address", args.Address())
	if err := router.Router().Run(args.Address()); err != nil {
		klog.ErrorS(err, "Router error")
		os.Exit(1)
	}
}
