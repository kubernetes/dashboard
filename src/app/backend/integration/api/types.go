// Copyright 2017 The Kubernetes Dashboard Authors.
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
type IntegrationID string

// Integration represents application integrated into the dashboard. Every application
// has to provide health check and id. Additionally every client supported by integration manager
// has to implement this interface
type Integration interface {
	HealthCheck() error
	ID() IntegrationID
}

// IntegrationState represents integration application state. Provides information about
// health (if dashboard can connect to it) of the integrated application.
// TODO(floreks): Support more information like 'installed' and 'enabled'.
type IntegrationState struct {
	Connected   bool    `json:"connected"`
	LastChecked v1.Time `json:"lastChecked"`
	Error       error   `json:"error"`
}
