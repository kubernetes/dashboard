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
	"encoding/json"

	"dario.cat/mergo"
)

const (
	// ConfigMapSettingsKey is a settings map key that maps to current settings.
	ConfigMapSettingsKey = "settings"

	// ConcurrentSettingsChangeError occurs during settings save if settings were modified concurrently.
	// Keep it in sync with concurrentChangeErr_ constant from the frontend.
	ConcurrentSettingsChangeError = "settings changed since last reload"
)

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

func (s *Settings) Default() *Settings {
	if s == nil {
		return &defaultSettings
	}

	_ = mergo.Merge(&s, defaultSettings)

	return s
}

func (s *Settings) Marshal() string {
	bytes, _ := json.Marshal(s)
	return string(bytes)
}

func UnmarshalSettings(data string) (*Settings, error) {
	s := new(Settings)
	err := json.Unmarshal([]byte(data), s)
	return s, err
}
