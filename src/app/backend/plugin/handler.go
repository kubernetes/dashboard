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

package plugin

import (
  "github.com/kubernetes/dashboard/src/app/backend/errors"
  "net/http"
  "strings"

  "github.com/emicklei/go-restful"
  clientapi "github.com/kubernetes/dashboard/src/app/backend/client/api"
)

// Handler manages all endpoints related to plugin use cases, such as list and get.
type Handler struct {
  cManager clientapi.ClientManager
}

// Install creates new endpoints for integrations. All information that any integration would want
// to expose by creating new endpoints should be kept here, i.e. helm integration might want to
// create endpoint to list available releases/charts.
//
// By default endpoint for checking state of the integrations is installed. It allows user
// to check state of integration by accessing `<DASHBOARD_URL>/api/v1/integration/{name}/state`.
func (h *Handler) Install(ws *restful.WebService) {
  ws.Route(
    ws.GET("/plugins/{namespace}").
      To(h.handlePluginList).
      Writes(PluginList{}))

  ws.Route(
    ws.GET("/plugin/{namespace}/{pluginName}").
      To(h.servePluginSource))
}

// NewPluginHandler creates plugin.Handler.
func NewPluginHandler(cManager clientapi.ClientManager) *Handler {
  return &Handler{cManager: cManager}
}

func (h *Handler) handlePluginList(request *restful.Request, response *restful.Response) {
  pluginClient, err := h.cManager.PluginClient(request)
  if err != nil {
    errors.HandleInternalError(response, err)
    return
  }
  namespace := request.PathParameter("namespace")

  result, err := GetPluginList(pluginClient, namespace)
  if err != nil {
    errors.HandleInternalError(response, err)
    return
  }
  response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (h *Handler) servePluginSource(request *restful.Request, response *restful.Response) {
  pluginClient, err := h.cManager.PluginClient(request)
  if err != nil {
    errors.HandleInternalError(response, err)
    return
  }
  k8sClient, err := h.cManager.Client(request)
  if err != nil {
    errors.HandleInternalError(response, err)
    return
  }
  namespace := request.PathParameter("namespace")
  // Removes .js extension if it's present
  pluginName := strings.Split(request.PathParameter("pluginName"), ".")[0]

  result, err := GetPluginSource(pluginClient, k8sClient, namespace, pluginName)
  if err != nil {
    errors.HandleInternalError(response, err)
    return
  }
  response.Write(result)
}
