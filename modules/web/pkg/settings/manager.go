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
	"reflect"
	"sync"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/kubernetes"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/web/pkg/args"

	"k8s.io/dashboard/errors"
)

const (
	// ConfigMapSettingsKey is a settings map key that maps to current settings.
	ConfigMapSettingsKey = "settings"

	// PinnedResourcesKey is a settings map key which maps to current pinned resources.
	PinnedResourcesKey = "pinnedResources"

	// ConcurrentSettingsChangeError occurs during settings save if settings were modified concurrently.
	// Keep it in sync with concurrentChangeErr_ constant from the frontend.
	ConcurrentSettingsChangeError = "settings changed since last reload"

	// PinnedResourceNotFoundError occurs while deleting pinned resource if the resource wasn't already pinned.
	PinnedResourceNotFoundError = "pinned resource not found"
)

// SettingsManager is a structure containing all settings manager members.
type SettingsManager struct {
	settings        *Settings
	pinnedResources PinnedResources
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

// load config map data into the settings manager and return true if new settings are different.
func (sm *SettingsManager) load(client kubernetes.Interface) (changed bool) {
	configMap, err := client.CoreV1().ConfigMaps(args.Namespace()).
		Get(context.Background(), args.SettingsConfigMapName(), metav1.GetOptions{})
	if err != nil {
		klog.ErrorS(err, "could not get settings config map")
		return
	}

	// Check if anything has changed from the last time when the function was executed.
	changed = !reflect.DeepEqual(sm.rawSettings, configMap.Data)

	if changed {
		sm.mux.Lock()
		defer sm.mux.Unlock()
		sm.rawSettings = configMap.Data

		if pinnedResources, ok := sm.rawSettings[PinnedResourcesKey]; ok {
			if p, err := UnmarshalPinnedResources(pinnedResources); err != nil {
				klog.ErrorS(err, "cannot unmarshal pinned resources", "pinnedResources", pinnedResources)
			} else {
				sm.pinnedResources = *p
			}
		}

		if settings, ok := sm.rawSettings[ConfigMapSettingsKey]; ok {
			if s, err := UnmarshalSettings(settings); err != nil {
				klog.ErrorS(err, "cannot unmarshal settings", "settings", settings)
			} else {
				sm.settings = s
			}
		}
	}

	return
}

func (sm *SettingsManager) GetGlobalSettings(client kubernetes.Interface) *Settings {
	_ = sm.load(client)

	return sm.settings.Default()
}

func (sm *SettingsManager) SaveGlobalSettings(client kubernetes.Interface, s *Settings) error {
	if changed := sm.load(client); changed {
		return errors.NewInvalid(ConcurrentSettingsChangeError)
	}

	defer sm.load(client)

	sm.settings = s.Default()

	return sm.patchConfigMap(client, ConfigMapSettingsKey, sm.settings.Marshal())
}

func (sm *SettingsManager) GetPinnedResources(client kubernetes.Interface) (r []PinnedResource) {
	_ = sm.load(client)

	return sm.pinnedResources
}

func (sm *SettingsManager) SavePinnedResource(client kubernetes.Interface, r *PinnedResource) error {
	if changed := sm.load(client); changed {
		return errors.NewInvalid(ConcurrentSettingsChangeError)
	}

	if sm.pinnedResources.Includes(r) {
		return nil
	}

	defer sm.load(client)

	sm.pinnedResources = append(sm.pinnedResources, *r)
	return sm.patchConfigMap(client, PinnedResourcesKey, sm.pinnedResources.Marshal())
}

func (sm *SettingsManager) DeletePinnedResource(client kubernetes.Interface, r *PinnedResource) error {
	if changed := sm.load(client); changed {
		return errors.NewInvalid(ConcurrentSettingsChangeError)
	}

	if !sm.pinnedResources.Includes(r) {
		return errors.NewNotFound(PinnedResourceNotFoundError)
	}

	defer sm.load(client)

	sm.pinnedResources = sm.pinnedResources.Delete(r)

	return sm.patchConfigMap(client, PinnedResourcesKey, sm.pinnedResources.Marshal())
}

func (sm *SettingsManager) patchConfigMap(client kubernetes.Interface, key, value string) error {
	patch, err := json.Marshal(v1.ConfigMap{Data: map[string]string{key: value}})
	if err != nil {
		return err
	}

	_, err = client.CoreV1().ConfigMaps(args.Namespace()).
		Patch(context.Background(), args.SettingsConfigMapName(), types.MergePatchType, patch, metav1.PatchOptions{})
	return err
}
