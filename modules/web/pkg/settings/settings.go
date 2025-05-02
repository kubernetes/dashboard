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
	"github.com/samber/lo"
)

var defaultSettings = Settings{
	ClusterName:                      lo.ToPtr(""),
	ItemsPerPage:                     lo.ToPtr(10),
	LabelsLimit:                      lo.ToPtr(3),
	LogsAutoRefreshTimeInterval:      lo.ToPtr(5),
	ResourceAutoRefreshTimeInterval:  lo.ToPtr(10),
	DisableAccessDeniedNotifications: lo.ToPtr(false),
	HideAllNamespaces:                lo.ToPtr(false),
	DefaultNamespace:                 lo.ToPtr("default"),
	NamespaceFallbackList:            []string{"default"},
}

type Settings struct {
	ClusterName                      *string  `json:"clusterName,omitempty"`
	ItemsPerPage                     *int     `json:"itemsPerPage,omitempty"`
	LabelsLimit                      *int     `json:"labelsLimit,omitempty"`
	LogsAutoRefreshTimeInterval      *int     `json:"logsAutoRefreshTimeInterval,omitempty"`
	ResourceAutoRefreshTimeInterval  *int     `json:"resourceAutoRefreshTimeInterval,omitempty"`
	DisableAccessDeniedNotifications *bool    `json:"disableAccessDeniedNotifications,omitempty"`
	HideAllNamespaces                *bool    `json:"hideAllNamespaces,omitempty"`
	DefaultNamespace                 *string  `json:"defaultNamespace,omitempty"`
	NamespaceFallbackList            []string `json:"namespaceFallbackList,omitempty"`
}

func (s *Settings) Default() *Settings {
	if s == nil {
		return &defaultSettings
	}

	_ = mergo.Merge(s, defaultSettings)

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
