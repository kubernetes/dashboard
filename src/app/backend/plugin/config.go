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
  "github.com/emicklei/go-restful"
  "github.com/kubernetes/dashboard/src/app/backend/handler/parser"
  apiErrors "k8s.io/apimachinery/pkg/api/errors"
  "net/http"
)

type Metadata struct {
  Name         string   `json:"name"`
  Path         string   `json:"path"`
  Dependencies []string `json:"dependencies"`
}

type Config struct {
  Status         int32      `json:"status"`
  PluginMetadata []Metadata `json:"plugins,omitempty"`
  Errors         []error    `json:"errors,omitempty"`
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
  if err != nil {
    handleConfigError(response, err, nil)
    return
  }

  dataSelect := parser.ParseDataSelectPathParameter(request)
  result, err := GetPluginList(pluginClient, "", dataSelect)
  if err != nil {
    if result != nil && len(result.Errors) > 0 {
      handleConfigError(response, err, result.Errors)
    } else {
      handleConfigError(response, err, nil)
    }
    return
  }

  config := Config{
    Status: http.StatusOK,
    PluginMetadata: toPluginMetadata(result.Items, func(plugin Plugin) Metadata {
      return Metadata{
        Name:         plugin.Name,
        Path:         plugin.Path,
        Dependencies: plugin.Dependencies,
      }
    }),
    Errors: result.Errors,
  }
  response.WriteHeaderAndEntity(http.StatusOK, config)
}

func handleConfigError(response *restful.Response, err error, nonCriticalErrors []error) {
  statusError, ok := err.(*apiErrors.StatusError)
  cfg := Config{Errors: append([]error{err}, nonCriticalErrors...)}
  if ok && statusError.Status().Code == 401 {
    cfg.Status = statusError.Status().Code
  } else {
    cfg.Status = http.StatusUnprocessableEntity
  }
  response.WriteHeaderAndEntity(http.StatusOK, cfg)
}
