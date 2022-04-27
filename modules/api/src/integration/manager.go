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

package integration

import (
	"fmt"

	clientapi "github.com/kubernetes/dashboard/src/app/backend/client/api"
	"github.com/kubernetes/dashboard/src/app/backend/integration/api"
	"github.com/kubernetes/dashboard/src/app/backend/integration/metric"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// IntegrationManager is responsible for management of all integrated applications.
type IntegrationManager interface {
	// IntegrationsGetter is responsible for listing all supported integrations.
	IntegrationsGetter
	// GetState returns state of integration based on its' id.
	GetState(id api.IntegrationID) (*api.IntegrationState, error)
	// Metric returns metric manager that is responsible for management of metric integrations.
	Metric() metric.MetricManager
}

// Implements IntegrationManager interface
type integrationManager struct {
	metric metric.MetricManager
}

// Metric implements integration manager interface. See IntegrationManager for more information.
func (self *integrationManager) Metric() metric.MetricManager {
	return self.metric
}

// GetState implements integration manager interface. See IntegrationManager for more information.
func (self *integrationManager) GetState(id api.IntegrationID) (*api.IntegrationState, error) {
	for _, i := range self.List() {
		if i.ID() == id {
			return self.getState(i), nil
		}
	}
	return nil, fmt.Errorf("Integration with given id %s does not exist", id)
}

// Checks and returns state of the provided integration application.
func (self *integrationManager) getState(integration api.Integration) *api.IntegrationState {
	result := &api.IntegrationState{
		Error: integration.HealthCheck(),
	}

	result.Connected = result.Error == nil
	result.LastChecked = v1.Now()

	return result
}

// NewIntegrationManager creates integration manager.
func NewIntegrationManager(manager clientapi.ClientManager) IntegrationManager {
	return &integrationManager{
		metric: metric.NewMetricManager(manager),
	}
}
