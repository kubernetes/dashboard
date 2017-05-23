package heapster

import (
	"k8s.io/client-go/rest"
	"log"
)

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
	return c.client.Get().Prefix("proxy").
		Namespace("kube-system").
		Resource("services").
		Name("heapster").
		Suffix("/api/v1" + path)
}

func (self inClusterHeapsterClient) HealthCheck() error {
	return healthCheck(self)
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

func (self remoteHeapsterClient) HealthCheck() error {
	return healthCheck(self)
}

func healthCheck(client HeapsterRESTClient) error {
	_, err := client.Get("healthz").AbsPath("/").DoRaw()
	if err == nil {
		log.Print("Successful initial request to heapster")
		return nil
	}

	return err
}
