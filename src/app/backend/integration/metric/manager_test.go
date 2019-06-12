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
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	integrationapi "github.com/kubernetes/dashboard/src/app/backend/integration/api"
	"github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
)

const fakeMetricClientID integrationapi.IntegrationID = "test-id"

type FakeMetricClient struct {
	healthOk bool
}

func (FakeMetricClient) ID() integrationapi.IntegrationID {
	return fakeMetricClientID
}

func (self FakeMetricClient) HealthCheck() error {
	if self.healthOk {
		return nil
	}

	return errors.NewInvalid("test-error")
}

func (self FakeMetricClient) DownloadMetric(selectors []api.ResourceSelector, metricName string,
	cachedResources *api.CachedResources) api.MetricPromises {
	return nil
}

func (self FakeMetricClient) DownloadMetrics(selectors []api.ResourceSelector, metricNames []string,
	cachedResources *api.CachedResources) api.MetricPromises {
	return nil
}

func (self FakeMetricClient) AggregateMetrics(metrics api.MetricPromises, metricName string,
	aggregations api.AggregationModes) api.MetricPromises {
	return nil
}

func areErrorsEqual(err1, err2 error) bool {
	return (err1 != nil && err2 != nil && err1.Error() == err2.Error()) ||
		(err1 == nil && err2 == nil)
}

func TestNewMetricManager(t *testing.T) {
	metricManager := NewMetricManager(nil)
	if metricManager == nil {
		t.Error("Failed to create metric manager.")
	}
}

func TestMetricManager_Client(t *testing.T) {
	cases := []struct {
		client   api.MetricClient
		expected api.MetricClient
	}{
		{&FakeMetricClient{healthOk: false}, nil},
		{&FakeMetricClient{healthOk: true}, &FakeMetricClient{healthOk: true}},
	}

	for _, c := range cases {
		metricManager := NewMetricManager(nil)
		metricManager.AddClient(c.client)
		metricManager.Enable(fakeMetricClientID)
		client := metricManager.Client()

		if !reflect.DeepEqual(client, c.expected) {
			t.Errorf("Failed to get active metric client. Expected: %v, but got %v.",
				c.expected, client)
		}
	}
}

func TestMetricManager_Enable(t *testing.T) {
	cases := []struct {
		client   api.MetricClient
		expected error
	}{
		{&FakeMetricClient{healthOk: false}, errors.NewInvalid("Health check failed: test-error")},
		{&FakeMetricClient{healthOk: true}, nil},
	}

	for _, c := range cases {
		metricManager := NewMetricManager(nil)
		metricManager.AddClient(c.client)
		err := metricManager.Enable(fakeMetricClientID)

		if !areErrorsEqual(err, c.expected) {
			t.Errorf("Failed to enable metric client. Expected error to be %v, but "+
				"got %v.", c.expected, err)
		}
	}
}

func TestMetricManager_List(t *testing.T) {
	cases := []struct {
		client          api.MetricClient
		expectedClients int
	}{
		{&FakeMetricClient{healthOk: false}, 1},
		{nil, 0},
	}

	for _, c := range cases {
		metricManager := NewMetricManager(nil)
		metricManager.AddClient(c.client)
		list := metricManager.List()

		if len(list) != c.expectedClients {
			t.Errorf("Expected number of clients to be %v, but got %v.",
				c.expectedClients, len(list))
		}
	}
}

func TestMetricManager_ConfigureHeapster(t *testing.T) {
	cases := []struct {
		manager         MetricManager
		expectedClients int
	}{
		{NewMetricManager(client.NewClientManager("", "http://localhost:8080")), 1},
	}

	for _, c := range cases {
		c.manager.ConfigureHeapster("")

		if len(c.manager.List()) != c.expectedClients {
			t.Errorf("Failed to configure heapster. Expected number of clients to be "+
				"%d, but got %d.", c.expectedClients, len(c.manager.List()))
		}
	}
}
