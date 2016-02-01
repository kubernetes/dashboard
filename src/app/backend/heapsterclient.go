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

package main

import (
	"bytes"
	"log"

	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// Clients for making requests to a Heapster instance.
type HeapsterClient interface {
	// Creates a new GET http request to heapster.
	Get() *client.Request
}

// Creates new Heapster REST client. When heapsterHost param is empty string the function
// assumes that it is running inside a Kubernetes cluster and connects via service proxy.
// heapsterHost param is in the format of protocol://address:port, e.g., http://localhost:8002.
func CreateHeapsterRESTClient(heapsterHost string, apiclient *client.Client) (
	HeapsterClient, error) {

	cfg := client.Config{}

	if heapsterHost == "" {
		bufferProxyHost := bytes.NewBufferString("http://")
		bufferProxyHost.WriteString(apiclient.RESTClient.Get().URL().Host)
		cfg.Host = bufferProxyHost.String()
		cfg.Prefix = "/api/v1/proxy/namespaces/kube-system/services/heapster/api"
	} else {
		cfg.Host = heapsterHost
	}
	log.Printf("Creating Heapster REST client for %s%s", cfg.Host, cfg.Prefix)
	clientFactory := new(ClientFactoryImpl)
	heapsterClient, err := clientFactory.New(&cfg)
	if err != nil {
		return nil, err
	}
	return heapsterClient.RESTClient, nil
}
