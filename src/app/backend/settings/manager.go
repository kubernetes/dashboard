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
	"errors"
	"log"
	"reflect"

	clientapi "github.com/kubernetes/dashboard/src/app/backend/client/api"
	"github.com/kubernetes/dashboard/src/app/backend/settings/api"
	"k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

// SettingsManager is a structure containing all settings manager members.
type SettingsManager struct {
	settings      map[string]api.Settings
	rawSettings   map[string]string
	clientManager clientapi.ClientManager
}

// NewSettingsManager creates new settings manager.
func NewSettingsManager(clientManager clientapi.ClientManager) SettingsManager {
	return SettingsManager{
		settings:      make(map[string]api.Settings),
		clientManager: clientManager,
	}
}

// load config map data into settings manager and return true if new settings are different.
func (sm *SettingsManager) load(client kubernetes.Interface) (configMap *v1.ConfigMap, isDifferent bool) {
	configMap, err := client.CoreV1().ConfigMaps(api.SettingsConfigMapNamespace).
		Get(api.SettingsConfigMapName, metav1.GetOptions{})
	if err != nil {
		log.Printf("Cannot find settings config map: %s", err.Error())
		sm.restoreConfigMap(client)
		return
	}

	// Check if anything has changed from the last time when function was executed.
	isDifferent = !reflect.DeepEqual(sm.rawSettings, configMap.Data)

	if isDifferent {
		sm.rawSettings = configMap.Data
		sm.settings = make(map[string]api.Settings)
		for key, value := range sm.rawSettings {
			s, err := api.Unmarshal(value)
			if err != nil {
				log.Printf("Cannot unmarshal settings key %s with %s value: %s", key, value, err.Error())
			} else {
				sm.settings[key] = *s
			}
		}
	}

	return
}

// restoreConfigMap restores settings config map using default global settings.
func (sm *SettingsManager) restoreConfigMap(client kubernetes.Interface) {
	restoredConfigMap, err := client.CoreV1().ConfigMaps(api.SettingsConfigMapNamespace).
		Create(api.GetDefaultSettingsConfigMap())
	if err != nil {
		log.Printf("Cannot restore settings config map: %s", err.Error())
	} else {
		sm.settings = make(map[string]api.Settings)
		sm.settings[api.GlobalSettingsKey] = api.GetDefaultSettings()
		sm.rawSettings = restoredConfigMap.Data
	}
}

// GetGlobalSettings implements SettingsManager interface. Check it for more information.
func (sm *SettingsManager) GetGlobalSettings(client kubernetes.Interface) api.Settings {
	cm, _ := sm.load(client)
	if cm == nil {
		return api.GetDefaultSettings()
	}

	s, ok := sm.settings[api.GlobalSettingsKey]
	if !ok {
		return api.GetDefaultSettings()
	}

	return s
}

// GetGlobalSettings implements SettingsManager interface. Check it for more information.
func (sm *SettingsManager) SaveGlobalSettings(client kubernetes.Interface, s *api.Settings) error {
	cm, isDiff := sm.load(client)
	if isDiff {
		return errors.New(api.ConcurrentSettingsChangeError)
	}

	cm.Data[api.GlobalSettingsKey] = s.Marshal()
	_, err := client.CoreV1().ConfigMaps(api.SettingsConfigMapNamespace).Update(cm)
	return err
}
