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
	"encoding/json"
	"net/http"
)

// HealthHandler manages all endpoints related to system banner management.
type HealthHandler struct {
	manager HealthManager
}

// Install creates new endpoints for system banner management.
func (self *HealthHandler) Install(w http.ResponseWriter, _ *http.Request) (int, error) {
	w.Header().Set("Content-Type", "application/json")
	return http.StatusOK, json.NewEncoder(w).Encode(self.manager.Get())
}

// NewHealthHandler creates HealthHandler.
func NewHealthHandler(manager HealthManager) HealthHandler {
	return HealthHandler{manager: manager}
}
