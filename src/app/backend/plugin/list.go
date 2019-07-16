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
	"fmt"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	pluginclientset "github.com/kubernetes/dashboard/src/app/backend/plugin/client/clientset/versioned"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// PluginList holds only necessary information and is used to
// map v1alpha1.PluginList to plugin.PluginList
type PluginList struct {
	ListMeta api.ListMeta `json:"listMeta"`
	Plugins  []Plugin     `json:"plugins"`
	Errors   []error      `json:"errors"`
}

// PluginList holds only necessary information and is used to
// map v1alpha1.Plugin to plugin.Plugin
type Plugin struct {
	Name         string   `json:"name"`
	Path         string   `json:"path"`
	Dependencies []string `json:"dependencies"`
}

// GetPluginList returns all the registered plugins
func GetPluginList(client pluginclientset.Interface, ns string) (*PluginList, error) {
	pluginList, err := client.DashboardV1alpha1().Plugins(ns).List(v1.ListOptions{})
	if err != nil {
		return nil, err
	}

	result := &PluginList{Errors: []error{}, Plugins: []Plugin{}}
	for _, plugin := range pluginList.Items {
		result.Plugins = append(result.Plugins,
			Plugin{
				Name:         plugin.Name,
				Path:         fmt.Sprintf("/plugin/%s/%s.js", plugin.Namespace, plugin.Name),
				Dependencies: []string{}})
		result.ListMeta.TotalItems++
	}
	return result, nil
}
