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

	// SettingsConfigMapNamespace contains a namespace of config map, that stores settings.
	SettingsConfigMapNamespace = "kube-system"

	// ConfigMapKindName is a name of config map kind.
	ConfigMapKindName = "ConfigMap"

	// ConfigMapAPIVersion is a API version of config map.
	ConfigMapAPIVersion = "v1"

	// GlobalSettingsKey is a settings map key which maps to current global settings.
	GlobalSettingsKey = "_global"

	// ConcurrentSettingsChangeError occurs during settings save if settings were modified concurrently.
	// Keep it in sync with CONCURRENT_CHANGE_ERROR constant from the frontend.
	ConcurrentSettingsChangeError = "settings changed since last reload"
)

// SettingsManager is used for user settings management.
type SettingsManager interface {
	// GetGlobalSettings gets current global settings from config map.
	GetGlobalSettings(client kubernetes.Interface) (s *Settings)
	// SaveGlobalSettings saves provided global settings in config map.
	SaveGlobalSettings(client kubernetes.Interface, s *Settings)
}

// Settings is a single instance of settings without context.
type Settings struct {
	ClusterName             string `json:"clusterName"`
	ItemsPerPage            int    `json:"itemsPerPage"`
	AutoRefreshTimeInterval int    `json:"autoRefreshTimeInterval"`
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
	ClusterName:             "",
	ItemsPerPage:            10,
	AutoRefreshTimeInterval: 5,
}

// GetDefaultSettings returns settings structure, that should be used if there are no
// global or local settings overriding them. It should not change during runtime.
func GetDefaultSettings() Settings {
	return defaultSettings
}

// GetDefaultSettingsConfigMap returns config map with default settings.
func GetDefaultSettingsConfigMap() *corev1.ConfigMap {
	return &corev1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name:      SettingsConfigMapName,
			Namespace: SettingsConfigMapNamespace,
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
