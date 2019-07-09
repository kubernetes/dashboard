package plugin

import (
	"fmt"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	pluginclientset "github.com/kubernetes/dashboard/src/app/backend/plugin/client/clientset/versioned"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type PluginList struct {
	ListMeta api.ListMeta `json:"listMeta"`
	Plugins  []Plugin     `json:"plugins"`
	Errors   []error      `json:"errors"`
}

type Plugin struct {
	Name         string   `json:"name"`
	Path         string   `json:"path"`
	Dependencies []string `json:"dependencies"`
}

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
