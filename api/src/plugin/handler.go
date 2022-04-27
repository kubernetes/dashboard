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
	"net/http"
	"path/filepath"
	"strings"

	"github.com/kubernetes/dashboard/src/app/backend/handler/parser"

	"github.com/emicklei/go-restful/v3"
	clientapi "github.com/kubernetes/dashboard/src/app/backend/client/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
)

const (
	contentTypeHeader = "Content-Type"
	jsContentType     = "text/javascript; charset=utf-8"
)

// Handler manages all endpoints related to plugin use cases, such as list and get.
type Handler struct {
	cManager clientapi.ClientManager
}

// Install creates new endpoints for plugins. All information that any plugin would want
// to expose by creating new endpoints should be kept here, i.e. plugin service might want to
// create endpoint to list available proxy paths to another backend.
//
// By default, endpoint for getting and listing plugins is installed. It allows user
// to list the installed plugins and get the source code for a plugin.
func (h *Handler) Install(ws *restful.WebService) {
	ws.Route(
		ws.GET("/plugin/config").
			To(h.handleConfig),
	)

	ws.Route(
		ws.GET("/plugin/{namespace}").
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
	dataSelect := parser.ParseDataSelectPathParameter(request)

	result, err := GetPluginList(pluginClient, namespace, dataSelect)
	if err != nil {
		errors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (h *Handler) servePluginSource(request *restful.Request, response *restful.Response) {
	// TODO: Change these to secure clients once SystemJS can send proper auth headers.
	pluginClient := h.cManager.InsecurePluginClient()
	k8sClient := h.cManager.InsecureClient()

	namespace := request.PathParameter("namespace")
	// Removes .js extension if it's present
	pluginName := request.PathParameter("pluginName")
	name := strings.TrimSuffix(pluginName, filepath.Ext(pluginName))

	result, err := GetPluginSource(pluginClient, k8sClient, namespace, name)
	if err != nil {
		errors.HandleInternalError(response, err)
		return
	}
	response.AddHeader(contentTypeHeader, jsContentType)
	response.Write(result)
}
