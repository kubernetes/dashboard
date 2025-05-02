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
	"net/http"

	"github.com/emicklei/go-restful/v3"

	"k8s.io/dashboard/api/pkg/integration/api"
)

// Handler manages all endpoints related to integrated applications, such as state.
type Handler struct {
	manager Manager
}

// Install creates new endpoints for integrations. All information that any integration would want
// to expose by creating new endpoints should be kept here, i.e. helm integration might want to
// create endpoint to list available releases/charts.
//
// By default, endpoint for checking state of the integrations is installed. It allows user
// to check state of integration by accessing `<DASHBOARD_URL>/api/v1/integration/{name}/state`.
func (self Handler) Install(ws *restful.WebService) {
	ws.Route(
		ws.GET("/integration/{name}/state").
			To(self.handleGetState).
			Writes(api.IntegrationState{}))
}

func (self Handler) handleGetState(request *restful.Request, response *restful.Response) {
	integrationName := request.PathParameter("name")
	state, err := self.manager.GetState(api.IntegrationID(integrationName))
	if err != nil {
		response.AddHeader("Content-Type", "text/plain")
		_ = response.WriteErrorString(http.StatusInternalServerError, err.Error()+"\n")
		return
	}
	_ = response.WriteHeaderAndEntity(http.StatusOK, state)
}

// NewHandler creates Handler.
func NewHandler(manager Manager) Handler {
	return Handler{manager: manager}
}
