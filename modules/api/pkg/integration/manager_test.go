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

package integration_test

import (
	"strings"
	"testing"

	"k8s.io/dashboard/api/pkg/integration"
	"k8s.io/dashboard/api/pkg/integration/api"
	"k8s.io/dashboard/errors"
)

func areErrorsEqual(err1, err2 error) bool {
	return (err1 != nil && err2 != nil && normalize(err1.Error()) == normalize(err2.Error())) ||
		(err1 == nil && err2 == nil)
}

// Removes all quote signs that might have been added to the message.
// Might depend on dependencies version how they are constructed.
func normalize(msg string) string {
	return strings.Replace(msg, "\"", "", -1)
}

func TestNewIntegrationManager(t *testing.T) {
	iManager := integration.NewIntegrationManager()
	if iManager == nil {
		t.Error("Failed to create integration manager.")
	}
}

func TestIntegrationManager_GetState(t *testing.T) {
	cases := []struct {
		info          string
		apiServerHost string
		sidecarHost   string
		expected      *api.IntegrationState
		expectedErr   error
	}{
		{
			"Server provided and using external sidecar",
			"http://127.0.0.1:8080", "http://127.0.0.1:8081", &api.IntegrationState{
				Connected: false,
				Error:     errors.NewInvalid("Get http://127.0.0.1:8081/healthz: dial tcp 127.0.0.1:8081: connect: connection refused"),
			}, nil,
		},
	}

	for _, c := range cases {
		iManager := integration.NewIntegrationManager()
		iManager.Metric().ConfigureSidecar(c.sidecarHost)

		state, err := iManager.GetState(api.SidecarIntegrationID)
		if !areErrorsEqual(err, c.expectedErr) {
			t.Errorf("Test Case: %s. Expected error to be: %v, but got %v.",
				c.info, c.expectedErr, err)
		}

		// Time is irrelevant so we don't need to check it
		if c.expectedErr == nil && (!areErrorsEqual(state.Error, c.expected.Error)) {
			t.Errorf("Test Case: %s. Expected state to be: %v, but got %v.",
				c.info, c.expected.Error, state.Error)
		} else if state.Connected != c.expected.Connected {
			t.Errorf("Test Case: %s. Could not connect to API server.",
				c.info)
		}
	}
}

func TestIntegrationManager_Metric(t *testing.T) {
	metricManager := integration.NewIntegrationManager().Metric()
	if metricManager == nil {
		t.Error("Failed to get metric manager.")
	}
}
