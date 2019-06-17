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

package metric

import (
	"fmt"
	"log"
	"time"

	clientapi "github.com/kubernetes/dashboard/src/app/backend/client/api"
	integrationapi "github.com/kubernetes/dashboard/src/app/backend/integration/api"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/integration/metric/heapster"
	"github.com/kubernetes/dashboard/src/app/backend/integration/metric/sidecar"
	"k8s.io/apimachinery/pkg/util/wait"
)

// MetricManager is responsible for management of all integrated applications related to metrics.
type MetricManager interface {
	// AddClient adds metric client to client list supported by this manager.
	AddClient(metricapi.MetricClient) MetricManager
	// Client returns active Metric client.
	Client() metricapi.MetricClient
	// Enable is responsible for switching active client if given integration application id
	// is found and related application is healthy (we can connect to it).
	Enable(integrationapi.IntegrationID) error
	// EnableWithRetry works similar to enable. It runs in a separate thread and tries to enable integration with given
	// id every 'period' seconds.
	EnableWithRetry(id integrationapi.IntegrationID, period time.Duration)
	// List returns list of available metric related integrations.
	List() []integrationapi.Integration
	// ConfigureSidecar configures and adds sidecar to clients list.
	ConfigureSidecar(host string) MetricManager
	// ConfigureHeapster configures and adds sidecar to clients list.
	ConfigureHeapster(host string) MetricManager
}

// Implements MetricManager interface.
type metricManager struct {
	manager clientapi.ClientManager
	clients map[integrationapi.IntegrationID]metricapi.MetricClient
	active  metricapi.MetricClient
}

// AddClient implements metric manager interface. See MetricManager for more information.
func (self *metricManager) AddClient(client metricapi.MetricClient) MetricManager {
	if client != nil {
		self.clients[client.ID()] = client
	}

	return self
}

// Client implements metric manager interface. See MetricManager for more information.
func (self *metricManager) Client() metricapi.MetricClient {
	return self.active
}

// Enable implements metric manager interface. See MetricManager for more information.
func (self *metricManager) Enable(id integrationapi.IntegrationID) error {
	metricClient, exists := self.clients[id]
	if !exists {
		return fmt.Errorf("No metric client found for integration id: %s", id)
	}

	err := metricClient.HealthCheck()
	if err != nil {
		return fmt.Errorf("Health check failed: %s", err.Error())
	}

	self.active = metricClient
	return nil
}

// EnableWithRetry implements metric manager interface. See MetricManager for more information.
func (self *metricManager) EnableWithRetry(id integrationapi.IntegrationID, period time.Duration) {
	go wait.Forever(func() {
		metricClient, exists := self.clients[id]
		if !exists {
			log.Printf("Metric client with given id %s does not exist.", id)
			return
		}

		err := metricClient.HealthCheck()
		if err != nil {
			self.active = nil
			log.Printf("Metric client health check failed: %s. Retrying in %d seconds.", err, period)
			return
		}

		if self.active == nil {
			log.Printf("Successful request to %s", id)
			self.active = metricClient
		}
	}, period*time.Second)
}

// List implements metric manager interface. See MetricManager for more information.
func (self *metricManager) List() []integrationapi.Integration {
	result := make([]integrationapi.Integration, 0)
	for _, c := range self.clients {
		result = append(result, c.(integrationapi.Integration))
	}

	return result
}

// ConfigureSidecar implements metric manager interface. See MetricManager for more information.
func (self *metricManager) ConfigureSidecar(host string) MetricManager {
	kubeClient := self.manager.InsecureClient()
	metricClient, err := sidecar.CreateSidecarClient(host, kubeClient)
	if err != nil {
		log.Printf("There was an error during sidecar client creation: %s", err.Error())
		return self
	}

	self.clients[metricClient.ID()] = metricClient
	return self
}

// ConfigureHeapster implements metric manager interface. See MetricManager for more information.
func (self *metricManager) ConfigureHeapster(host string) MetricManager {
	kubeClient := self.manager.InsecureClient()
	metricClient, err := heapster.CreateHeapsterClient(host, kubeClient)
	if err != nil {
		log.Printf("There was an error during heapster client creation: %s", err.Error())
		return self
	}

	self.clients[metricClient.ID()] = metricClient
	return self
}

// NewMetricManager creates metric manager.
func NewMetricManager(manager clientapi.ClientManager) MetricManager {
	return &metricManager{
		manager: manager,
		clients: make(map[integrationapi.IntegrationID]metricapi.MetricClient),
	}
}
