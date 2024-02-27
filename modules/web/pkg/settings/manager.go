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
	"encoding/json"
	"log"
	"net/http"
	"reflect"
	"sync"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/kubernetes"
	"k8s.io/dashboard/web/pkg/args"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/errors"
)

// SettingsManager is a structure containing all settings manager members.
type SettingsManager struct {
	settings        *Settings
	pinnedResources []PinnedResource
	rawSettings     map[string]string
	mux             sync.Mutex
}

// SettingsManagerI is used for user settings management.
type SettingsManagerI interface {
	// GetGlobalSettings gets current global settings from config map.
	GetGlobalSettings(client kubernetes.Interface) (s *Settings)
	// SaveGlobalSettings saves provided global settings in config map.
	SaveGlobalSettings(client kubernetes.Interface, s *Settings) error
	// GetPinnedResources gets the pinned resources from config map.
	GetPinnedResources(client kubernetes.Interface) (r []PinnedResource)
	// SavePinnedResource adds a new pinned resource to config map.
	SavePinnedResource(client kubernetes.Interface, r *PinnedResource) error
	// DeletePinnedResource removes a pinned resource from config map.
	DeletePinnedResource(client kubernetes.Interface, r *PinnedResource) error
}

// NewSettingsManager creates new settings manager.
func NewSettingsManager() SettingsManagerI {
	return &SettingsManager{
		settings:        new(Settings),
		pinnedResources: []PinnedResource{},
	}
}

// load config map data into settings manager and return true if new settings are different.
func (sm *SettingsManager) load(client kubernetes.Interface) (configMap *v1.ConfigMap, isDifferent bool) {
	configMap, err := client.CoreV1().ConfigMaps(args.Namespace()).
		Get(context.TODO(), args.SettingsConfigMapName(), metav1.GetOptions{})
	if err != nil {
		log.Printf("Cannot find settings config map: %s", err.Error())
		err = sm.restoreConfigMap(client)
		if err != nil {
			log.Printf("Cannot restore settings config map: %s", err.Error())
		}
		return
	}

	// Check if anything has changed from the last time when function was executed.
	isDifferent = !reflect.DeepEqual(sm.rawSettings, configMap.Data)

	if isDifferent {
		sm.mux.Lock()
		defer sm.mux.Unlock()
		sm.rawSettings = configMap.Data
		sm.settings = new(Settings)

		if pinnedResources, ok := sm.rawSettings[PinnedResourcesKey]; ok {
			if p, err := UnmarshalPinnedResources(pinnedResources); err != nil {
				klog.InfoS("Cannot unmarshal pinned resources", "pinnedResources", pinnedResources, "error", err)
			} else {
				sm.pinnedResources = *p
			}
		}

		if settings, ok := sm.rawSettings[ConfigMapSettingsKey]; ok {
			if s, err := UnmarshalSettings(settings); err != nil {
				klog.InfoS("Cannot unmarshal settings", "settings", settings, "error", err)
			} else {
				sm.settings = s
			}
		}
	}

	return
}

// restoreConfigMap restores settings config map using default global settings.
func (sm *SettingsManager) restoreConfigMap(client kubernetes.Interface) error {
	configMap := &v1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name:      args.SettingsConfigMapName(),
			Namespace: args.Namespace(),
		},
		Data: map[string]string{
			ConfigMapSettingsKey: defaultSettings.Marshal(),
		},
	}

	restoredConfigMap, err := client.CoreV1().ConfigMaps(args.Namespace()).
		Create(context.TODO(), configMap, metav1.CreateOptions{})
	if err != nil {
		return err
	}

	sm.settings = &defaultSettings
	sm.rawSettings = restoredConfigMap.Data

	return nil
}

func (sm *SettingsManager) GetGlobalSettings(client kubernetes.Interface) *Settings {
	_, _ = sm.load(client)

	return sm.settings.Default()
}

func (sm *SettingsManager) SaveGlobalSettings(client kubernetes.Interface, s *Settings) error {
	_, isDiff := sm.load(client)
	if isDiff {
		return errors.NewInvalid(ConcurrentSettingsChangeError)
	}

	defer sm.load(client)

	data := map[string]*Settings{ConfigMapSettingsKey: s.Default()}
	marshal, err := json.Marshal(data)
	if err != nil {
		return err
	}

	_, err = client.CoreV1().ConfigMaps(args.Namespace()).
		Patch(context.TODO(), args.SettingsConfigMapName(), types.MergePatchType, marshal, metav1.PatchOptions{})
	return err
}

func (sm *SettingsManager) GetPinnedResources(client kubernetes.Interface) (r []PinnedResource) {
	cm, _ := sm.load(client)
	if cm == nil {
		return
	}

	return sm.pinnedResources
}

func (sm *SettingsManager) SavePinnedResource(client kubernetes.Interface, r *PinnedResource) error {
	cm, isDiff := sm.load(client)
	if isDiff {
		return errors.NewInvalid(ConcurrentSettingsChangeError)
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
		return errors.NewGenericResponse(http.StatusConflict, ResourceAlreadyPinnedError)
	}

	defer sm.load(client)
	sm.pinnedResources = append(sm.pinnedResources, *r)
	cm.Data[PinnedResourcesKey] = MarshalPinnedResources(sm.pinnedResources)
	_, err := client.CoreV1().ConfigMaps(args.Namespace()).Update(context.TODO(), cm, metav1.UpdateOptions{})
	return err
}

func (sm *SettingsManager) DeletePinnedResource(client kubernetes.Interface, r *PinnedResource) error {
	cm, isDiff := sm.load(client)
	if isDiff {
		return errors.NewInvalid(ConcurrentSettingsChangeError)
	}

	// Data can be nil if the configMap exists but does not have any data
	if cm.Data == nil {
		return errors.NewNotFound(PinnedResourceNotFoundError)
	}

	index := len(sm.pinnedResources)
	for i, pinnedResource := range sm.pinnedResources {
		if pinnedResource.IsEqual(r) {
			index = i
		}
	}

	if index == len(sm.pinnedResources) {
		return errors.NewNotFound(PinnedResourceNotFoundError)
	}

	defer sm.load(client)
	sm.pinnedResources = append(sm.pinnedResources[:index], sm.pinnedResources[index+1:]...)
	cm.Data[PinnedResourcesKey] = MarshalPinnedResources(sm.pinnedResources)
	_, err := client.CoreV1().ConfigMaps(args.Namespace()).Update(context.TODO(), cm, metav1.UpdateOptions{})
	return err
}
