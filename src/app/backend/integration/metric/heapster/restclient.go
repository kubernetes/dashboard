// Copyright 2017 The Kubernetes Authors.
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

package heapster

import (
	"k8s.io/client-go/rest"
)

// HeapsterRESTClient is used to make raw requests to heapster.
type HeapsterRESTClient interface {
	// Creates a new GET HTTP request to heapster, specified by the path param, to the V1 API
	// endpoint. The path param is without the API prefix, e.g.,
	// /model/namespaces/default/pod-list/foo/metrics/memory-usage
	Get(path string) RequestInterface
	HealthCheck() error
}

// RequestInterface is an interface that allows to make operations on pure request object.
// Separation is done to allow testing.
type RequestInterface interface {
	DoRaw() ([]byte, error)
	AbsPath(segments ...string) *rest.Request
}

// InClusterHeapsterClient is an in-cluster implementation of a Heapster client. Talks with Heapster
// through service proxy.
type inClusterHeapsterClient struct {
	client rest.Interface
}

// Get creates request to given path.
func (c inClusterHeapsterClient) Get(path string) RequestInterface {
	return c.client.Get().
		Namespace("kube-system").
		Resource("services").
		Name("heapster").
		SubResource("proxy").
		Suffix("/api/v1/" + path)
}

// HealthCheck does a health check of the application.
// Returns nil if connection to application can be established, error object otherwise.
func (self inClusterHeapsterClient) HealthCheck() error {
	_, err := self.client.Get().
		Namespace("kube-system").
		Resource("services").
		Name("heapster").
		SubResource("proxy").
		Suffix("/healthz").
		DoRaw()
	return err
}

// RemoteHeapsterClient is an implementation of a remote Heapster client. Talks with Heapster
// through raw RESTClient.
type remoteHeapsterClient struct {
	client rest.Interface
}

// Get creates request to given path.
func (c remoteHeapsterClient) Get(path string) RequestInterface {
	return c.client.Get().Suffix(path)
}

// HealthCheck does a health check of the application.
// Returns nil if connection to application can be established, error object otherwise.
func (self remoteHeapsterClient) HealthCheck() error {
	_, err := self.Get("healthz").AbsPath("/").DoRaw()
	return err
}
