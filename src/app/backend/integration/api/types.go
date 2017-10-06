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

package api

import "k8s.io/apimachinery/pkg/apis/meta/v1"

// IntegrationID is a unique identification string that every integrated app has to provide.
// All ids are kept in this file to minimize the risk of creating conflicts.
// TODO: if necessary some kind of ID tracker should be added
type IntegrationID string

// Integration app IDs should be registered in this block.
const (
	HeapsterIntegrationID IntegrationID = "heapster"
)

// Integration represents application integrated into the dashboard. Every application
// has to provide health check and id. Additionally every client supported by integration manager
// has to implement this interface
type Integration interface {
	// HealthCheck is required in order to check state of integration application. We have to
	// be able to connect to it in order to enable it for users. Returns nil if connection
	// can be established, error otherwise.
	HealthCheck() error
	// ID returns unique id of integration application.
	ID() IntegrationID
}

// IntegrationState represents integration application state. Provides information about
// health (if dashboard can connect to it) of the integrated application.
// TODO(floreks): Remove once storage sync is implemented
// ----------------IMPORTANT----------------
// Until external storage sync is implemented information about state of integration is refreshed
// on every request to ensure that every dashboard replica always returns up-to-date data.
// It does not make dashboard stateful in any way.
// ----------------IMPORTANT----------------
// TODO(floreks): Support more information like 'installed' and 'enabled'.
type IntegrationState struct {
	Connected   bool    `json:"connected"`
	LastChecked v1.Time `json:"lastChecked"`
	Error       error   `json:"error"`
}
