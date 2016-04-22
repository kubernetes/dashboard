// Copyright 2015 Google Inc. All Rights Reserved.
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

package client

import (
	"log"

	client "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/client/unversioned/clientcmd"
	clientcmdapi "k8s.io/kubernetes/pkg/client/unversioned/clientcmd/api"
)

// Dashboard UI default values for client configs.
const (
	// High enough QPS to fit all expected use cases. QPS=0 is not set here, because
	// client code is overriding it.
	defaultQPS = 1e6
	// High enough Burst to fit all expected use cases. Burst=0 is not set here, because
	// client code is overriding it.
	defaultBurst = 1e6
)

// CreateApiserverClient creates new Kubernetes Apiserver client. When apiserverHost param is empty
// string the function assumes that it is running inside a Kubernetes cluster and attempts to
// discover the Apiserver. Otherwise, it connects to the Apiserver specified.
//
// apiserverHost param is in the format of protocol://address:port/pathPrefix, e.g.,
// http://localhost:8001.
func CreateApiserverClient(apiserverHost string) (*client.Client, clientcmd.ClientConfig, error) {

	overrides := &clientcmd.ConfigOverrides{}

	if apiserverHost != "" {
		overrides.ClusterInfo = clientcmdapi.Cluster{Server: apiserverHost}
	}

	clientConfig := clientcmd.NewNonInteractiveDeferredLoadingClientConfig(
		&clientcmd.ClientConfigLoadingRules{}, overrides)

	cfg, err := clientConfig.ClientConfig()
	cfg.QPS = defaultQPS
	cfg.Burst = defaultBurst

	if err != nil {
		return nil, nil, err
	}

	log.Printf("Creating API server client for %s", cfg.Host)

	client, err := client.New(cfg)

	if err != nil {
		return nil, nil, err
	}
	return client, clientConfig, nil
}
