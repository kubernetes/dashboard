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

	"github.com/gin-gonic/gin"

	"k8s.io/dashboard/client"
	"k8s.io/dashboard/errors"
	"k8s.io/dashboard/web/pkg/router"
	"k8s.io/dashboard/web/pkg/settings/api"
)

var manager = NewSettingsManager()

// TODO: Enable canI.
func init() {
	//router.V1().GET("/settings/global/cani", handleGetSettingsGlobalCanI)
	router.V1().GET("/settings/global", handleGetSettingGlobal)
	router.V1().PUT("/settings/global", handleSettingsGlobalSave)
	//router.V1().GET("/settings/pinner/cani", handleGetSettingsGlobalCanI)
	router.V1().GET("/settings/pinner", handleSettingsGetPinned)
	router.V1().PUT("/settings/pinner", handleSettingsSavePinned)
	router.V1().DELETE("/settings/pinner/:kind/:nameOrNamespace/:name", handleSettingsDeletePinned)
	router.V1().DELETE("/settings/pinner/:kind/:nameOrNamespace", handleSettingsDeletePinned)
}

//func handleGetSettingsGlobalCanI(c *gin.Context) {
//	if args.DisableSettingsAuthorizer() {
//		c.JSON(http.StatusOK, clientapi.CanIResponse{Allowed: true})
//		return
//	}
//
//	verb := c.Param("verb")
//	if len(verb) == 0 {
//		verb = http.MethodGet
//	}
//
//	canI := x.CanI(c.Request, clientapi.ToSelfSubjectAccessReview(
//		args.Namespace(),
//		api.SettingsConfigMapName,
//		api.ConfigMapKindName,
//		verb,
//	))
//
//	c.JSON(http.StatusOK, clientapi.CanIResponse{Allowed: canI})
//}

func handleGetSettingGlobal(c *gin.Context) {
	k8sClient := client.InClusterClient()
	c.JSON(http.StatusOK, manager.GetGlobalSettings(k8sClient))
}

func handleSettingsGlobalSave(c *gin.Context) {
	k8sClient := client.InClusterClient()
	settings := new(api.Settings)
	if err := c.Bind(settings); err != nil {
		c.JSON(http.StatusBadRequest, err)
		return
	}

	if err := manager.SaveGlobalSettings(k8sClient, settings); err != nil {
		code, err := errors.HandleError(err)
		c.JSON(code, err)
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

func handleSettingsGetPinned(c *gin.Context) {
	k8sClient := client.InClusterClient()
	c.JSON(http.StatusOK, manager.GetPinnedResources(k8sClient))
}

func handleSettingsSavePinned(c *gin.Context) {
	k8sClient, err := client.Client(c.Request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	pinnedResource := new(api.PinnedResource)
	if err := c.Bind(pinnedResource); err != nil {
		c.JSON(http.StatusBadRequest, err)
		return
	}

	if err := manager.SavePinnedResource(k8sClient, pinnedResource); err != nil {
		code, err := errors.HandleError(err)
		c.JSON(code, err)
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

func handleSettingsDeletePinned(c *gin.Context) {
	k8sClient, err := client.Client(c.Request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	// TODO: Export this workaround to some func.
	name := c.Request.PathValue("name")
	namespace := c.Request.PathValue("nameOrNamespace")
	if len(name) == 0 {
		name = namespace
		namespace = ""
	}

	resource := &api.PinnedResource{
		Kind:      c.Request.PathValue("kind"),
		Name:      name,
		Namespace: namespace,
	}

	if err := manager.DeletePinnedResource(k8sClient, resource); err != nil {
		code, err := errors.HandleError(err)
		c.JSON(code, err)
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
