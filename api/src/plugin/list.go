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
	"context"
	"fmt"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/plugin/apis/v1alpha1"
	pluginclientset "github.com/kubernetes/dashboard/src/app/backend/plugin/client/clientset/versioned"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// PluginList holds only necessary information and is used to
// map v1alpha1.PluginList to plugin.PluginList
type PluginList struct {
	ListMeta api.ListMeta `json:"listMeta"`
	Items    []Plugin     `json:"items"`
	Errors   []error      `json:"errors"`
}

// PluginList holds only necessary information and is used to
// map v1alpha1.Plugin to plugin.Plugin
type Plugin struct {
	ObjectMeta   api.ObjectMeta `json:"objectMeta"`
	TypeMeta     api.TypeMeta   `json:"typeMeta"`
	Name         string         `json:"name"`
	Path         string         `json:"path"`
	Dependencies []string       `json:"dependencies"`
}

type PluginCell v1alpha1.Plugin

func (p PluginCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
	switch name {
	case dataselect.NameProperty:
		return dataselect.StdComparableString(p.ObjectMeta.Name)
	case dataselect.CreationTimestampProperty:
		return dataselect.StdComparableTime(p.ObjectMeta.CreationTimestamp.Time)
	case dataselect.NamespaceProperty:
		return dataselect.StdComparableString(p.ObjectMeta.Namespace)
	default:
		// if name is not supported then just return a constant dummy value, sort will have no effect.
		return nil
	}
}

// GetPluginList returns all the registered plugins
func GetPluginList(client pluginclientset.Interface, ns string, dsQuery *dataselect.DataSelectQuery) (*PluginList, error) {
	plugins, err := client.DashboardV1alpha1().Plugins(ns).List(context.TODO(), v1.ListOptions{})
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return &PluginList{Items: []Plugin{}, Errors: []error{criticalError}}, nil
	}

	result := toPluginList(plugins.Items, nonCriticalErrors, dsQuery)
	return result, nil
}

func toPluginList(plugins []v1alpha1.Plugin, nonCriticalErrors []error, dsQuery *dataselect.DataSelectQuery) *PluginList {
	result := &PluginList{
		Items:    make([]Plugin, 0),
		ListMeta: api.ListMeta{TotalItems: len(plugins)},
		Errors:   nonCriticalErrors,
	}

	pluginCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(plugins), dsQuery)
	plugins = fromCells(pluginCells)
	result.ListMeta = api.ListMeta{TotalItems: filteredTotal}

	for _, item := range plugins {
		result.Items = append(result.Items, toPlugin(item))
	}

	return result
}

func toPlugin(plugin v1alpha1.Plugin) Plugin {
	return Plugin{
		ObjectMeta:   api.NewObjectMeta(plugin.ObjectMeta),
		TypeMeta:     api.NewTypeMeta(api.ResourceKindPlugin),
		Name:         plugin.ObjectMeta.Name,
		Path:         fmt.Sprintf("/api/v1/%s/%s/%s.js", api.ResourceKindPlugin, plugin.Namespace, plugin.Name),
		Dependencies: append([]string{}, plugin.Spec.Dependencies...),
	}
}

func toCells(std []v1alpha1.Plugin) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = PluginCell(std[i])
	}
	return cells
}

func fromCells(cells []dataselect.DataCell) []v1alpha1.Plugin {
	std := make([]v1alpha1.Plugin, len(cells))
	for i := range std {
		std[i] = v1alpha1.Plugin(cells[i].(PluginCell))
	}
	return std
}
