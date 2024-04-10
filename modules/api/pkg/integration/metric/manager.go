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
	"time"

	"k8s.io/apimachinery/pkg/util/wait"
	"k8s.io/klog/v2"

	integrationapi "k8s.io/dashboard/api/pkg/integration/api"
	metricapi "k8s.io/dashboard/api/pkg/integration/metric/api"
	"k8s.io/dashboard/api/pkg/integration/metric/sidecar"
	"k8s.io/dashboard/client"
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
}

// Implements MetricManager interface.
type metricManager struct {
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
			klog.V(5).InfoS("Metric client does not exist", "clientID", id)
			return
		}

		err := metricClient.HealthCheck()
		if err != nil {
			self.active = nil
			klog.Errorf("Metric client health check failed: %s. Retrying in %d seconds.", err, period)
			return
		}

		if self.active == nil {
			klog.V(1).Infof("Successful request to %s", id)
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
	inClusterClient := client.InClusterClient()
	metricClient, err := sidecar.CreateSidecarClient(host, inClusterClient)
	if err != nil {
		klog.Errorf("There was an error during sidecar client creation: %s", err.Error())
		return self
	}

	self.clients[metricClient.ID()] = metricClient
	return self
}

// NewMetricManager creates metric manager.
func NewMetricManager() MetricManager {
	return &metricManager{
		clients: make(map[integrationapi.IntegrationID]metricapi.MetricClient),
	}
}
