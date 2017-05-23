package integration

import (
	"fmt"
	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/integration/api"
	"github.com/kubernetes/dashboard/src/app/backend/integration/metric"
	"k8s.io/apimachinery/pkg/apis/meta/v1"
)

type IntegrationManager interface {
	List() []api.Integration
	GetState(id api.IntegrationID) (*api.IntegrationState, error)

	Metric() metric.MetricManager
}

type integrationManager struct {
	metric metric.MetricManager
}

func (self *integrationManager) List() []api.Integration {
	result := make([]api.Integration, 0)

	// Append all types of integrations
	result = append(result, self.Metric().List()...)

	return result
}

func (self *integrationManager) Metric() metric.MetricManager {
	return self.metric
}

func (self *integrationManager) GetState(id api.IntegrationID) (
	*api.IntegrationState, error) {
	for _, i := range self.List() {
		if i.ID() == id {
			return self.getState(i), nil
		}
	}
	return nil, fmt.Errorf("Integration with given id %s does not exist", id)
}

func (self *integrationManager) getState(integration api.Integration) *api.IntegrationState {
	result := &api.IntegrationState{
		Error: integration.HealthCheck(),
	}

	result.Connected = (result.Error != nil && len(result.Error.Error()) == 0)
	result.LastChecked = v1.Now()

	return result
}

func NewIntegrationManager(manager client.ClientManager) IntegrationManager {
	return &integrationManager{
		metric: metric.NewMetricManager(manager),
	}
}
