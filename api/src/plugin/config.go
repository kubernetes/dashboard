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

	"github.com/emicklei/go-restful/v3"
	"github.com/kubernetes/dashboard/src/app/backend/handler/parser"
	apiErrors "k8s.io/apimachinery/pkg/api/errors"
)

// Config holds the information required by the frontend application to bootstrap.
type Config struct {
	Status         int32      `json:"status"`
	PluginMetadata []Metadata `json:"plugins"`
	Errors         []error    `json:"errors,omitempty"`
}

// Metadata holds least possible plugin information for Config.
type Metadata struct {
	Name         string   `json:"name"`
	Path         string   `json:"path"`
	Dependencies []string `json:"dependencies"`
}

func toPluginMetadata(vs []Plugin, f func(plugin Plugin) Metadata) []Metadata {
	vsm := make([]Metadata, len(vs))
	for i, v := range vs {
		vsm[i] = f(v)
	}
	return vsm
}

func (h *Handler) handleConfig(request *restful.Request, response *restful.Response) {
	pluginClient, err := h.cManager.PluginClient(request)
	cfg := Config{Status: http.StatusOK, PluginMetadata: []Metadata{}, Errors: []error{}}
	if err != nil {
		cfg.Status = statusCodeFromError(err)
		cfg.Errors = append(cfg.Errors, err)
		response.WriteHeaderAndEntity(http.StatusOK, cfg)
		return
	}

	dataSelect := parser.ParseDataSelectPathParameter(request)
	result, err := GetPluginList(pluginClient, "", dataSelect)
	if err != nil {
		cfg.Status = statusCodeFromError(err)
		cfg.Errors = append(cfg.Errors, err)
		response.WriteHeaderAndEntity(http.StatusOK, cfg)
		return
	}

	if result != nil && len(result.Errors) > 0 {
		cfg.Status = statusCodeFromError(result.Errors[0])
		cfg.Errors = append(cfg.Errors, result.Errors...)
		response.WriteHeaderAndEntity(http.StatusOK, cfg)
		return
	}

	cfg.PluginMetadata = toPluginMetadata(result.Items, func(plugin Plugin) Metadata {
		return Metadata{
			Name:         plugin.Name,
			Path:         plugin.Path,
			Dependencies: plugin.Dependencies,
		}
	})
	cfg.Errors = result.Errors
	response.WriteHeaderAndEntity(http.StatusOK, cfg)
}

func statusCodeFromError(err error) int32 {
	if statusError, ok := err.(*apiErrors.StatusError); ok {
		return statusError.Status().Code
	}
	return http.StatusUnprocessableEntity
}
