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

package health

import (
	client "github.com/kubernetes/dashboard/src/app/backend/client/api"
	health "github.com/kubernetes/dashboard/src/app/backend/health/api"
)

// HealthManager is a structure containing all system banner manager members.
type HealthManager struct {
	client client.ClientManager
}

// NewHealthManager creates new settings manager.
func NewHealthManager(client client.ClientManager) HealthManager {
	return HealthManager{
		client: client,
	}
}

// Get implements HealthManager interface. Check it for more information.
func (sbm *HealthManager) Get() health.Health {
	_, err := sbm.client.InsecureClient().Discovery().ServerVersion()
	return health.Health{
		Running: err == nil,
	}
}
