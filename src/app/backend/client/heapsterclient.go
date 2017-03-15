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

	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

// HeapsterClient  is a client used to make requests to a Heapster instance.
type HeapsterClient interface {
	// Creates a new GET HTTP request to heapster, specified by the path param, to the V1 API
	// endpoint. The path param is without the API prefix, e.g.,
	// /model/namespaces/default/pod-list/foo/metrics/memory-usage
	Get(path string) RequestInterface
}

// RequestInterface is an interface that allows to make operations on pure request object.
// Separation is done to allow testing.
type RequestInterface interface {
	DoRaw() ([]byte, error)
}

// InClusterHeapsterClient is an in-cluster implementation of a Heapster client. Talks with Heapster
// through service proxy.
type InClusterHeapsterClient struct {
	client rest.Interface
}

// Get creates request to given path.
func (c InClusterHeapsterClient) Get(path string) RequestInterface {
	return c.client.Get().Prefix("proxy").
		Namespace("kube-system").
		Resource("services").
		Name("heapster").
		Suffix("/api/v1" + path)
}

// RemoteHeapsterClient is an implementation of a remote Heapster client. Talks with Heapster
// through raw RESTClient.
type RemoteHeapsterClient struct {
	client rest.Interface
}

// Get creates request to given path.
func (c RemoteHeapsterClient) Get(path string) RequestInterface {
	return c.client.Get().Suffix(path)
}

// CreateHeapsterRESTClient creates new Heapster REST client. When heapsterHost param is empty
// string the function assumes that it is running inside a Kubernetes cluster and connects via
// service proxy. heapsterHost param is in the format of protocol://address:port,
// e.g., http://localhost:8002.
func CreateHeapsterRESTClient(heapsterHost string, apiclient *kubernetes.Clientset) (
	HeapsterClient, error) {

	if heapsterHost == "" {
		log.Print("Creating in-cluster Heapster client")
		return InClusterHeapsterClient{client: apiclient.Core().RESTClient()}, nil
	}

	cfg := &rest.Config{Host: heapsterHost, QPS: defaultQPS, Burst: defaultBurst}
	restClient, err := kubernetes.NewForConfig(cfg)
	if err != nil {
		return nil, err
	}
	log.Printf("Creating remote Heapster client for %s", heapsterHost)
	return RemoteHeapsterClient{client: restClient.Core().RESTClient()}, nil
}
