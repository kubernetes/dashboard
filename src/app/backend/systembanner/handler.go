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
	"log"
	"net/http"

	restful "github.com/emicklei/go-restful"
	"github.com/kubernetes/dashboard/src/app/backend/systembanner/api"
	"k8s.io/apimachinery/pkg/api/errors"
)

// SystemBannerHandler manages all endpoints related to system banner management.
type SystemBannerHandler struct {
	manager SystemBannerManager
}

// Install creates new endpoints for system banner management.
func (self *SystemBannerHandler) Install(ws *restful.WebService) {
	ws.Route(
		ws.GET("/systembanner").
			To(self.handleGet).
			Writes(api.SystemBanner{}))
}

func (self *SystemBannerHandler) handleGet(request *restful.Request, response *restful.Response) {
	response.WriteHeaderAndEntity(http.StatusOK, self.manager.Get())
}

// handleInternalError writes the given error to the response and sets appropriate HTTP status headers.
func handleInternalError(response *restful.Response, err error) {
	log.Print(err)
	statusCode := http.StatusInternalServerError
	statusError, ok := err.(*errors.StatusError)
	if ok && statusError.Status().Code > 0 {
		statusCode = int(statusError.Status().Code)
	}
	response.AddHeader("Content-Type", "text/plain")
	response.WriteErrorString(statusCode, err.Error()+"\n")
}

// NewSystemBannerHandler creates SystemBannerHandler.
func NewSystemBannerHandler(manager SystemBannerManager) SystemBannerHandler {
	return SystemBannerHandler{manager: manager}
}
