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

package settings

import (
	"net/http"

	restful "github.com/emicklei/go-restful/v3"

	"github.com/kubernetes/dashboard/src/app/backend/args"
	clientapi "github.com/kubernetes/dashboard/src/app/backend/client/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/settings/api"
)

// SettingsHandler manages all endpoints related to settings management.
type SettingsHandler struct {
	manager       api.SettingsManager
	clientManager clientapi.ClientManager
}

// Install creates new endpoints for settings management.
func (self *SettingsHandler) Install(ws *restful.WebService) {
	ws.Route(
		ws.GET("/settings/global").
			To(self.handleSettingsGlobalGet).
			Writes(api.Settings{}))
	ws.Route(ws.GET("/settings/global/cani").
		To(self.handleSettingsGlobalCanI).
		Writes(clientapi.CanIResponse{}))
	ws.Route(
		ws.PUT("/settings/global").
			To(self.handleSettingsGlobalSave).
			Reads(api.Settings{}).
			Writes(api.Settings{}))

	ws.Route(
		ws.GET("/settings/pinner").
			To(self.handleSettingsGetPinned))
	ws.Route(
		ws.PUT("/settings/pinner").
			To(self.handleSettingsSavePinned))
	ws.Route(
		ws.GET("/settings/pinner/cani").
			To(self.handleSettingsGlobalCanI))
	ws.Route(
		ws.DELETE("/settings/pinner/{kind}/{name}").
			To(self.handleSettingsDeletePinned))
	ws.Route(
		ws.DELETE("/settings/pinner/{kind}/{namespace}/{name}").
			To(self.handleSettingsDeletePinned))
}

func (self *SettingsHandler) handleSettingsGlobalCanI(request *restful.Request, response *restful.Response) {
	verb := request.QueryParameter("verb")
	if len(verb) == 0 {
		verb = http.MethodGet
	}

	canI := self.clientManager.CanI(request, clientapi.ToSelfSubjectAccessReview(
		args.Holder.GetNamespace(),
		api.SettingsConfigMapName,
		api.ConfigMapKindName,
		verb,
	))

	if args.Holder.GetDisableSettingsAuthorizer() {
		canI = true
	}

	response.WriteHeaderAndEntity(http.StatusOK, clientapi.CanIResponse{Allowed: canI})
}

func (self *SettingsHandler) handleSettingsGlobalGet(request *restful.Request, response *restful.Response) {
	client := self.clientManager.InsecureClient()
	result := self.manager.GetGlobalSettings(client)
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (self *SettingsHandler) handleSettingsGlobalSave(request *restful.Request, response *restful.Response) {
	settings := new(api.Settings)
	if err := request.ReadEntity(settings); err != nil {
		errors.HandleInternalError(response, err)
		return
	}

	client, err := self.clientManager.Client(request)
	if err != nil {
		errors.HandleInternalError(response, err)
		return
	}

	if err := self.manager.SaveGlobalSettings(client, settings); err != nil {
		errors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, settings)
}

func (self *SettingsHandler) handleSettingsGetPinned(request *restful.Request, response *restful.Response) {
	client := self.clientManager.InsecureClient()
	result := self.manager.GetPinnedResources(client)
	response.WriteHeaderAndEntity(http.StatusOK, result)
}

func (self *SettingsHandler) handleSettingsSavePinned(request *restful.Request, response *restful.Response) {
	pinnedResource := new(api.PinnedResource)
	if err := request.ReadEntity(pinnedResource); err != nil {
		errors.HandleInternalError(response, err)
		return
	}

	client, err := self.clientManager.Client(request)
	if err != nil {
		errors.HandleInternalError(response, err)
		return
	}

	if err := self.manager.SavePinnedResource(client, pinnedResource); err != nil {
		errors.HandleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusCreated, pinnedResource)
}

func (self *SettingsHandler) handleSettingsDeletePinned(request *restful.Request, response *restful.Response) {
	pinnedResource := &api.PinnedResource{
		Kind:      request.PathParameter("kind"),
		Name:      request.PathParameter("name"),
		Namespace: request.PathParameter("namespace"),
	}

	client, err := self.clientManager.Client(request)
	if err != nil {
		errors.HandleInternalError(response, err)
		return
	}

	if err := self.manager.DeletePinnedResource(client, pinnedResource); err != nil {
		errors.HandleInternalError(response, err)
		return
	}
	response.WriteHeader(http.StatusNoContent)
}

// NewSettingsHandler creates SettingsHandler.
func NewSettingsHandler(manager api.SettingsManager, clientManager clientapi.ClientManager) SettingsHandler {
	return SettingsHandler{manager: manager, clientManager: clientManager}
}
