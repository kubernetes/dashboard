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

package api

import (
	"encoding/json"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

const (
	// SettingsConfigMapName contains a name of config map, that stores settings.
	SettingsConfigMapName = "kubernetes-dashboard-settings"

	// ConfigMapKindName is a name of config map kind.
	ConfigMapKindName = "ConfigMap"

	// ConfigMapAPIVersion is a API version of config map.
	ConfigMapAPIVersion = "v1"

	// GlobalSettingsKey is a settings map key which maps to current global settings.
	GlobalSettingsKey = "_global"

	// PinnedResourcesKey is a settings map key which maps to current pinned resources.
	PinnedResourcesKey = "_pinnedCRD"

	// ConcurrentSettingsChangeError occurs during settings save if settings were modified concurrently.
	// Keep it in sync with CONCURRENT_CHANGE_ERROR constant from the frontend.
	ConcurrentSettingsChangeError = "settings changed since last reload"

	// PinnedResourceNotFoundError occurs while deleting pinned resource, if the resource wasn't already pinned.
	PinnedResourceNotFoundError = "pinned resource not found"

	// ResourceAlreadyPinnedError occurs while pinning a new resource, if it has been pinned before.
	ResourceAlreadyPinnedError = "resource already pinned"
)

// SettingsManager is used for user settings management.
type SettingsManager interface {
	// GetGlobalSettings gets current global settings from config map.
	GetGlobalSettings(client kubernetes.Interface) (s Settings)
	// SaveGlobalSettings saves provided global settings in config map.
	SaveGlobalSettings(client kubernetes.Interface, s *Settings) error
	// GetPinnedResources gets the pinned resources from config map.
	GetPinnedResources(client kubernetes.Interface) (r []PinnedResource)
	// SavePinnedResource adds a new pinned resource to config map.
	SavePinnedResource(client kubernetes.Interface, r *PinnedResource) error
	// DeletePinnedResource removes a pinned resource from config map.
	DeletePinnedResource(client kubernetes.Interface, r *PinnedResource) error
}

// PinnedResource represents a pinned resource.
type PinnedResource struct {
	Kind        string `json:"kind"`
	Name        string `json:"name"`
	DisplayName string `json:"displayName"`
	Namespace   string `json:"namespace,omitempty"`
	Namespaced  bool   `json:"namespaced"`
}

func (p *PinnedResource) IsEqual(other *PinnedResource) bool {
	return p.Name == other.Name && p.Namespace == other.Namespace && p.Kind == other.Kind
}

// MarshalPinnedResources pinned resource into JSON object.
func MarshalPinnedResources(p []PinnedResource) string {
	bytes, _ := json.Marshal(p)
	return string(bytes)
}

// UnmarshalPinnedResources unmarshal pinned resource into object.
func UnmarshalPinnedResources(data string) (*[]PinnedResource, error) {
	p := new([]PinnedResource)
	err := json.Unmarshal([]byte(data), p)
	return p, err
}

// Settings is a single instance of settings without context.
type Settings struct {
	ClusterName                      string   `json:"clusterName"`
	ItemsPerPage                     int      `json:"itemsPerPage"`
	LabelsLimit                      int      `json:"labelsLimit"`
	LogsAutoRefreshTimeInterval      int      `json:"logsAutoRefreshTimeInterval"`
	ResourceAutoRefreshTimeInterval  int      `json:"resourceAutoRefreshTimeInterval"`
	DisableAccessDeniedNotifications bool     `json:"disableAccessDeniedNotifications"`
	DefaultNamespace                 string   `json:"defaultNamespace"`
	NamespaceFallbackList            []string `json:"namespaceFallbackList"`
}

// Marshal settings into JSON object.
func (s Settings) Marshal() string {
	bytes, _ := json.Marshal(s)
	return string(bytes)
}

// Unmarshal settings from JSON string into object.
func Unmarshal(data string) (*Settings, error) {
	s := new(Settings)
	err := json.Unmarshal([]byte(data), s)
	return s, err
}

// defaultSettings contains default values for every setting.
var defaultSettings = Settings{
	ClusterName:                      "",
	ItemsPerPage:                     10,
	LabelsLimit:                      3,
	LogsAutoRefreshTimeInterval:      5,
	ResourceAutoRefreshTimeInterval:  5,
	DisableAccessDeniedNotifications: false,
	DefaultNamespace:                 "default",
	NamespaceFallbackList:            []string{"default"},
}

// GetDefaultSettings returns settings structure, that should be used if there are no
// global or local settings overriding them. It should not change during runtime.
func GetDefaultSettings() Settings {
	return defaultSettings
}

// GetDefaultSettingsConfigMap returns config map with default settings.
func GetDefaultSettingsConfigMap(namespace string) *corev1.ConfigMap {
	return &corev1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name:      SettingsConfigMapName,
			Namespace: namespace,
		},
		TypeMeta: metav1.TypeMeta{
			Kind:       ConfigMapKindName,
			APIVersion: ConfigMapAPIVersion,
		},
		Data: map[string]string{
			GlobalSettingsKey: GetDefaultSettings().Marshal(),
		},
	}
}
