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
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	v1 "k8s.io/api/authorization/v1"

	"k8s.io/dashboard/web/pkg/args"

	"k8s.io/dashboard/client"
	"k8s.io/dashboard/errors"
	"k8s.io/dashboard/web/pkg/router"
)

var manager = NewSettingsManager()

const ConfigMapKindName = "ConfigMap"

type CanIResponse struct {
	Allowed bool `json:"allowed"`
}

// ToSelfSubjectAccessReview creates kubernetes API object based on provided data.
func ToSelfSubjectAccessReview(namespace, name, resourceKind, verb string) *v1.SelfSubjectAccessReview {
	return &v1.SelfSubjectAccessReview{
		Spec: v1.SelfSubjectAccessReviewSpec{
			ResourceAttributes: &v1.ResourceAttributes{
				Namespace: namespace,
				Name:      name,
				Resource:  fmt.Sprintf("%ss", strings.ToLower(resourceKind)),
				Verb:      strings.ToLower(verb),
			},
		},
	}
}

func init() {
	router.Root().GET("/settings/cani", handleGetSettingsGlobalCanI)
	router.Root().GET("/settings", handleGetSettingGlobal)
	router.Root().PUT("/settings", handleSettingsGlobalSave)
	router.Root().GET("/settings/pinnedresources/cani", handleGetSettingsGlobalCanI)
	router.Root().GET("/settings/pinnedresources", handleSettingsGetPinned)
	router.Root().PUT("/settings/pinnedresources", handleSettingsSavePinned)
	router.Root().DELETE("/settings/pinnedresources/:kind/:nameOrNamespace/:name", handleSettingsDeletePinned)
	router.Root().DELETE("/settings/pinnedresources/:kind/:nameOrNamespace", handleSettingsDeletePinned)
}

func handleGetSettingsGlobalCanI(c *gin.Context) {
	verb := c.Param("verb")
	if len(verb) == 0 {
		verb = http.MethodGet
	}

	canI := client.CanI(c.Request, ToSelfSubjectAccessReview(
		args.Namespace(),
		args.SettingsConfigMapName(),
		ConfigMapKindName,
		verb,
	))

	c.JSON(http.StatusOK, CanIResponse{Allowed: canI})
}

func handleGetSettingGlobal(c *gin.Context) {
	c.JSON(http.StatusOK, manager.GetGlobalSettings(client.InClusterClient()))
}

func handleSettingsGlobalSave(c *gin.Context) {
	k8sClient, err := client.Client(c.Request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	settings := new(Settings)
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

	pinnedResource := new(PinnedResource)
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
	name := c.Param("name")
	namespace := c.Param("nameOrNamespace")
	if len(name) == 0 {
		name = namespace
		namespace = ""
	}

	resource := &PinnedResource{
		Kind:      c.Param("kind"),
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
