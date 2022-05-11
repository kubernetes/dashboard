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

package systembanner

import (
	"encoding/json"
	"net/http"

	"k8s.io/dashboard/web/pkg/handler"
)

// SystemBannerHandler manages all endpoints related to system banner management.
type SystemBannerHandler struct {
	manager SystemBannerManager
}

// Install creates new endpoints for system banner management.
func (self *SystemBannerHandler) Install() {
	http.Handle("/systembanner", handler.AppHandler(self.handleGet))
}

func (self *SystemBannerHandler) handleGet(w http.ResponseWriter, _ *http.Request) (int, error) {
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	systemBanner := self.manager.Get()
	err := encoder.Encode(&systemBanner)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

// NewSystemBannerHandler creates SystemBannerHandler.
func NewSystemBannerHandler(manager SystemBannerManager) *SystemBannerHandler {
	return &SystemBannerHandler{manager: manager}
}
