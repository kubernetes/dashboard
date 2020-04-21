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
	"context"
	"log"
	"net/http"
	"reflect"
	"sync"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"

	"github.com/kubernetes/dashboard/src/app/backend/args"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/settings/api"
)

// SettingsManager is a structure containing all settings manager members.
type SettingsManager struct {
	settings        map[string]api.Settings
	pinnedResources []api.PinnedResource
	rawSettings     map[string]string
	mux             sync.Mutex
}

// NewSettingsManager creates new settings manager.
func NewSettingsManager() api.SettingsManager {
	return &SettingsManager{
		settings:        make(map[string]api.Settings),
		pinnedResources: []api.PinnedResource{},
	}
}

// load config map data into settings manager and return true if new settings are different.
func (sm *SettingsManager) load(client kubernetes.Interface) (configMap *v1.ConfigMap, isDifferent bool) {
	configMap, err := client.CoreV1().ConfigMaps(args.Holder.GetNamespace()).
		Get(context.TODO(), api.SettingsConfigMapName, metav1.GetOptions{})
	if err != nil {
		log.Printf("Cannot find settings config map: %s", err.Error())
		sm.restoreConfigMap(client)
		return
	}

	// Check if anything has changed from the last time when function was executed.
	isDifferent = !reflect.DeepEqual(sm.rawSettings, configMap.Data)

	if isDifferent {
		sm.mux.Lock()
		defer sm.mux.Unlock()
		sm.rawSettings = configMap.Data
		sm.settings = make(map[string]api.Settings)

		for key, value := range sm.rawSettings {
			if key == api.PinnedResourcesKey {
				p, err := api.UnmarshalPinnedResources(value)
				if err != nil {
					log.Printf("Cannot unmarshal settings key %s with %s value: %s", key, value, err.Error())
				} else {
					sm.pinnedResources = *p
				}
			} else {
				s, err := api.Unmarshal(value)
				if err != nil {
					log.Printf("Cannot unmarshal settings key %s with %s value: %s", key, value, err.Error())
				} else {
					sm.settings[key] = *s
				}
			}
		}
	}

	return
}

// restoreConfigMap restores settings config map using default global settings.
func (sm *SettingsManager) restoreConfigMap(client kubernetes.Interface) {
	restoredConfigMap, err := client.CoreV1().ConfigMaps(args.Holder.GetNamespace()).
		Create(context.TODO(), api.GetDefaultSettingsConfigMap(args.Holder.GetNamespace()), metav1.CreateOptions{})
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
		return errors.NewInvalid(api.ConcurrentSettingsChangeError)
	}

	// Data can be nil if the configMap exists but does not have any data
	if cm.Data == nil {
		cm.Data = make(map[string]string)
	}

	defer sm.load(client)
	cm.Data[api.GlobalSettingsKey] = s.Marshal()
	_, err := client.CoreV1().ConfigMaps(args.Holder.GetNamespace()).Update(context.TODO(), cm, metav1.UpdateOptions{})
	return err
}

func (sm *SettingsManager) GetPinnedResources(client kubernetes.Interface) (r []api.PinnedResource) {
	cm, _ := sm.load(client)
	if cm == nil {
		return
	}

	return sm.pinnedResources
}

func (sm *SettingsManager) SavePinnedResource(client kubernetes.Interface, r *api.PinnedResource) error {
	cm, isDiff := sm.load(client)
	if isDiff {
		return errors.NewInvalid(api.ConcurrentSettingsChangeError)
	}

	// Data can be nil if the configMap exists but does not have any data
	if cm.Data == nil {
		cm.Data = make(map[string]string)
	}

	exists := false
	for _, pinnedResource := range sm.pinnedResources {
		if pinnedResource.IsEqual(r) {
			exists = true
		}
	}

	if exists {
		return errors.NewGenericResponse(http.StatusConflict, api.ResourceAlreadyPinnedError)
	}

	defer sm.load(client)
	sm.pinnedResources = append(sm.pinnedResources, *r)
	cm.Data[api.PinnedResourcesKey] = api.MarshalPinnedResources(sm.pinnedResources)
	_, err := client.CoreV1().ConfigMaps(args.Holder.GetNamespace()).Update(context.TODO(), cm, metav1.UpdateOptions{})
	return err
}

func (sm *SettingsManager) DeletePinnedResource(client kubernetes.Interface, r *api.PinnedResource) error {
	cm, isDiff := sm.load(client)
	if isDiff {
		return errors.NewInvalid(api.ConcurrentSettingsChangeError)
	}

	// Data can be nil if the configMap exists but does not have any data
	if cm.Data == nil {
		return errors.NewNotFound(api.PinnedResourceNotFoundError)
	}

	index := len(sm.pinnedResources)
	for i, pinnedResource := range sm.pinnedResources {
		if pinnedResource.IsEqual(r) {
			index = i
		}
	}

	if index == len(sm.pinnedResources) {
		return errors.NewNotFound(api.PinnedResourceNotFoundError)
	}

	defer sm.load(client)
	sm.pinnedResources = append(sm.pinnedResources[:index], sm.pinnedResources[index+1:]...)
	cm.Data[api.PinnedResourcesKey] = api.MarshalPinnedResources(sm.pinnedResources)
	_, err := client.CoreV1().ConfigMaps(args.Holder.GetNamespace()).Update(context.TODO(), cm, metav1.UpdateOptions{})
	return err
}
