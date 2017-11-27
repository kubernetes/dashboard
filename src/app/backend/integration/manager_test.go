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
	"testing"

	"errors"

	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	"github.com/kubernetes/dashboard/src/app/backend/auth/jwe"
	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/integration/api"
	"github.com/kubernetes/dashboard/src/app/backend/sync"
	"k8s.io/client-go/kubernetes/fake"
)

func getTokenManager() authApi.TokenManager {
	c := fake.NewSimpleClientset()
	syncManager := sync.NewSynchronizerManager(c)
	holder := jwe.NewRSAKeyHolder(syncManager.Secret("", ""))
	return jwe.NewJWETokenManager(holder)
}

func areErrorsEqual(err1, err2 error) bool {
	return (err1 != nil && err2 != nil && err1.Error() == err2.Error()) ||
		(err1 == nil && err2 == nil)
}

func TestNewIntegrationManager(t *testing.T) {
	iManager := NewIntegrationManager(nil)
	if iManager == nil {
		t.Error("Failed to create integration manager.")
	}
}

func TestIntegrationManager_GetState(t *testing.T) {
	cases := []struct {
		info          string
		apiServerHost string
		heapsterHost  string
		expected      *api.IntegrationState
		expectedErr   error
	}{
		{
			"Server provided and using in-cluster heapster",
			"http://127.0.0.1:8080", "", &api.IntegrationState{
				Connected: false,
				Error:     errors.New("Get http://127.0.0.1:8080/api/v1/namespaces/kube-system/services/heapster/proxy/healthz: dial tcp 127.0.0.1:8080: getsockopt: connection refused"),
			}, nil,
		},
		{
			"Server provided and using external heapster",
			"http://127.0.0.1:8080", "http://127.0.0.1:8081", &api.IntegrationState{
				Connected: false,
				Error:     errors.New("Get http://127.0.0.1:8081/healthz: dial tcp 127.0.0.1:8081: getsockopt: connection refused"),
			}, nil,
		},
	}

	for _, c := range cases {
		cManager := client.NewClientManager("", c.apiServerHost)
		iManager := NewIntegrationManager(cManager)
		iManager.Metric().ConfigureHeapster(c.heapsterHost)

		state, err := iManager.GetState(api.HeapsterIntegrationID)
		if !areErrorsEqual(err, c.expectedErr) {
			t.Errorf("Test Case: %s. Expected error to be: %v, but got %v.",
				c.info, c.expectedErr, err)
		}

		// Time is irrelevant so we don't need to check it
		if c.expectedErr == nil && (!areErrorsEqual(state.Error, c.expected.Error) ||
			state.Connected != c.expected.Connected) {
			t.Errorf("Test Case: %s. Expected state to be: %v, but got %v.",
				c.info, c.expected, state)
		}
	}
}

func TestIntegrationManager_Metric(t *testing.T) {
	metricManager := NewIntegrationManager(nil).Metric()
	if metricManager == nil {
		t.Error("Failed to get metric manager.")
	}
}
