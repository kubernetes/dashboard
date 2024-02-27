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
	"reflect"
	"testing"

	"k8s.io/client-go/kubernetes/fake"
)

func TestNewSettingsManager(t *testing.T) {
	sm := NewSettingsManager().(*SettingsManager)

	if len(sm.settings) > 0 {
		t.Error("new settings manager should have no settings set")
	}
}

func TestSettingsManager_GetGlobalSettings(t *testing.T) {
	sm := NewSettingsManager()
	client := fake.NewSimpleClientset(GetDefaultSettingsConfigMap(""))
	gs := sm.GetGlobalSettings(client)

	if !reflect.DeepEqual(GetDefaultSettings(), gs) {
		t.Errorf("it should return default settings \"%v\" instead of \"%v\"", GetDefaultSettings(), gs)
	}
}

func TestSettingsManager_SaveGlobalSettings(t *testing.T) {
	sm := NewSettingsManager()
	client := fake.NewSimpleClientset(GetDefaultSettingsConfigMap(""))
	err := sm.SaveGlobalSettings(client, &defaultSettings)

	if err == nil {
		t.Errorf("it should fail with \"%s\" error if trying to save but manager has deprecated data",
			ConcurrentSettingsChangeError)
	}

	if !reflect.DeepEqual(err.Error(), ConcurrentSettingsChangeError) {
		t.Errorf("it should fail with \"%s\" error instead of \"%s\" if trying to save but manager has deprecated data",
			ConcurrentSettingsChangeError, err.Error())
	}

	if err = sm.SaveGlobalSettings(client, &defaultSettings); err != nil {
		t.Errorf("it should save settings if manager has no deprecated data instead of failing with \"%s\" error",
			err.Error())
	}
}
