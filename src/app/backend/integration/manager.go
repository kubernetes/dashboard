package integration

import (
	"fmt"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/integration/api"
	"github.com/kubernetes/dashboard/src/app/backend/integration/metric"
	"k8s.io/apimachinery/pkg/apis/meta/v1"
)

// IntegrationManager is responsible for management of all integrated applications.
type IntegrationManager interface {
	// List returns list of all supported integrations.
	List() []api.Integration
	// GetState returns state of integration based on its' id.
	GetState(id api.IntegrationID) (*api.IntegrationState, error)
	// Metric returns metric manager that is responsible for management of metric integrations.
	Metric() metric.MetricManager
}

// Implements IntegrationManager interface
type integrationManager struct {
	metric metric.MetricManager
}

// List implements integration manager interface. See IntegrationManager for more information.
func (self *integrationManager) List() []api.Integration {
	result := make([]api.Integration, 0)

	// Append all types of integrations
	result = append(result, self.Metric().List()...)

	return result
}

// Metric implements integration manager interface. See IntegrationManager for more information.
func (self *integrationManager) Metric() metric.MetricManager {
	return self.metric
}

// GetState implements integration manager interface. See IntegrationManager for more information.
func (self *integrationManager) GetState(id api.IntegrationID) (
	*api.IntegrationState, error) {
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

	result.Connected = (result.Error == nil)
	result.LastChecked = v1.Now()

	return result
}

// NewIntegrationManager creates integration manager.
func NewIntegrationManager(manager client.ClientManager) IntegrationManager {
	return &integrationManager{
		metric: metric.NewMetricManager(manager),
	}
}
