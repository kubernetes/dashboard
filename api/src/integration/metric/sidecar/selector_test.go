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

package sidecar

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestGetSidecarSelector(t *testing.T) {
	resource1 := map[string]string{
		"resource": "1",
	}
	resource2 := map[string]string{
		"resource": "2",
	}
	var cachedPodList = []v1.Pod{
		{
			ObjectMeta: metaV1.ObjectMeta{
				Name:      "1",
				Labels:    resource1,
				Namespace: "a",
			},
		},
		{
			ObjectMeta: metaV1.ObjectMeta{
				Name:      "2",
				Labels:    resource2,
				Namespace: "a",
			},
		},
		{
			ObjectMeta: metaV1.ObjectMeta{
				Name:      "3",
				Labels:    resource1,
				Namespace: "a",
			},
		},
		{
			ObjectMeta: metaV1.ObjectMeta{
				Name:      "4",
				Labels:    resource1,
				Namespace: "b",
			},
		},
		{
			ObjectMeta: metaV1.ObjectMeta{
				Name:   "5",
				Labels: resource1,
			},
		},
	}
	testCases := []struct {
		Info                   string
		ResourceSelector       metricapi.ResourceSelector
		ExpectedPath           string
		ExpectedTargetResource api.ResourceKind
		ExpectedResources      []string
	}{
		{
			"ResourceSelector for native resource - pod",
			metricapi.ResourceSelector{
				Namespace:    "bar",
				ResourceType: api.ResourceKindPod,
				ResourceName: "foo",
			},
			`namespaces/bar/pod-list/`,
			api.ResourceKindPod,
			[]string{"foo"},
		},
		{
			"ResourceSelector for native resource - node",
			metricapi.ResourceSelector{
				Namespace:    "barn",
				ResourceType: api.ResourceKindNode,
				ResourceName: "foon",
			},
			`nodes/`,
			api.ResourceKindNode,
			[]string{"foon"},
		},
		{
			"ResourceSelector for derived resource with old style selector",
			metricapi.ResourceSelector{
				Namespace:    "a",
				ResourceType: api.ResourceKindDeployment,
				ResourceName: "baba",
				Selector:     resource1,
			},
			`namespaces/a/pod-list/`,
			api.ResourceKindPod,
			[]string{"1", "3"},
		},
	}
	for _, testCase := range testCases {
		sel, err := getSidecarSelector(testCase.ResourceSelector,
			&metricapi.CachedResources{Pods: cachedPodList})
		if err != nil {
			t.Errorf("Test Case: %s. Failed to get SidecarSelector. - %s", testCase.Info, err)
			return
		}
		if !reflect.DeepEqual(sel.Resources, testCase.ExpectedResources) {
			t.Errorf("Test Case: %s. Converted resource selector to incorrect native resources. Got %v, expected %v.",
				testCase.Info, sel.Resources, testCase.ExpectedResources)
		}
		if sel.TargetResourceType != testCase.ExpectedTargetResource {
			t.Errorf("Test Case: %s. Used invalid target resource type. Got %s, expected %s.",
				testCase.Info, sel.TargetResourceType, testCase.ExpectedTargetResource)
		}
		if sel.Path != testCase.ExpectedPath {
			t.Errorf("Test Case: %s. Converted to invalid sidecar download path. Got %s, expected %s.",
				testCase.Info, sel.Path, testCase.ExpectedPath)
		}

	}
}
