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
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/settings/api"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

// SettingsManager is a structure containing all settings manager members.
type SettingsManager struct {
	GlobalSettings api.Settings
	UserSettings   map[string]api.Settings
	Client         kubernetes.Interface
}

// NewSettingsManager creates new settings manager.
func NewSettingsManager(client kubernetes.Interface) SettingsManager {
	sm := SettingsManager{
		GlobalSettings: api.GetDefaultSettings(),
		UserSettings:   map[string]api.Settings{},
		Client:         client,
	}

	sm.load()
	return sm
}

// load config map data into settings manager.
func (sm *SettingsManager) load() {
	cm, err := sm.Client.CoreV1().ConfigMaps(api.SettingsConfigMapNamespace).
		Get(api.SettingsConfigMapName, metav1.GetOptions{})
	if err != nil {
		log.Printf("Cannot find settings config map: %s", err.Error())
		sm.restoreDefaults()
		return
	}

	// Load global settings.
	value, ok := cm.Data[api.GlobalSettingsKey]
	if !ok {
		log.Printf("Cannot find global settings key %s in config map %s",
			api.GlobalSettingsKey, api.SettingsConfigMapName)
	} else {
		loadedGlobalSettings := api.Settings{}
		loadedGlobalSettings.Unmarshal(value)
		sm.GlobalSettings = loadedGlobalSettings
	}

	// TODO(maciaszczykm): Load user settings.
}

func (sm *SettingsManager) restoreDefaults() {
	_, err := sm.Client.CoreV1().ConfigMaps(api.SettingsConfigMapNamespace).Create(api.GetDefaultSettingsConfigMap())
	if err != nil {
		log.Printf("Cannot restore settings config map: %s", err.Error())
	} else {
		sm.GlobalSettings = api.GetDefaultSettings()
	}
}

// Get settings respecting following priority: user settings (if available), global settings (if available), defaults.
func (sm *SettingsManager) Get() (s api.Settings) {
	sm.load()

	// TODO(maciaszczykm): Respect priority order and allways fallback .
	return
}
