package integration

import (
	"github.com/kubernetes/dashboard/src/app/backend/integration/metric"
	"github.com/kubernetes/dashboard/src/app/backend/integration/metric/heapster"
	"k8s.io/client-go/kubernetes"
	"log"
)

type IntegrationClient interface {
	GetMetricClient() metric.MetricClient

	// Configuration block to easily configure and control status of integrations
	ConfigureHeapster(host string, client *kubernetes.Clientset) IntegrationClient
}

type integrationClientImpl struct {
	// TODO extend that to choose between clients
	metricClient metric.MetricClient
}

func (self integrationClientImpl) GetMetricClient() metric.MetricClient {
	// TODO extend that to choose between clients
	return self.metricClient
}

func NewIntegrationClient() IntegrationClient {
	return integrationClientImpl{}
}

func (self integrationClientImpl) ConfigureHeapster(host string,
	client *kubernetes.Clientset) IntegrationClient {
	heapsterClient, err := heapster.CreateHeapsterClient(host, client)
	if err != nil {
		log.Printf("Could not create heapster client: %s. Continuing.", err)
		return self
	}

	self.metricClient = heapsterClient
	return self
}