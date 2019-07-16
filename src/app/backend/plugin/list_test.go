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

package plugin

import (
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/plugin/apis/v1alpha1"
	fakePluginClientset "github.com/kubernetes/dashboard/src/app/backend/plugin/client/clientset/versioned/fake"
	coreV1 "k8s.io/api/core/v1"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestGetPluginList(t *testing.T) {
	ns := "default"
	pluginName := "test-plugin"
	filename := "plugin-test.js"
	cfgMapName := "plugin-test-cfgMap"

	pcs := fakePluginClientset.NewSimpleClientset()

	_, _ = pcs.DashboardV1alpha1().Plugins(ns).Create(&v1alpha1.Plugin{
		ObjectMeta: v1.ObjectMeta{Name: pluginName, Namespace: ns},
		Spec: v1alpha1.PluginSpec{
			Source: v1alpha1.Source{
				ConfigMapRef: &coreV1.ConfigMapEnvSource{
					LocalObjectReference: coreV1.LocalObjectReference{Name: cfgMapName},
				},
				Filename: filename}},
	})

	data, err := GetPluginList(pcs, ns)
	if err != nil {
		t.Errorf("error while fetching plugins: %s", err)
	}

	if data.ListMeta.TotalItems != 1 {
		t.Errorf("there should be one plugin registered, got %d", data.ListMeta.TotalItems)
	}
}
