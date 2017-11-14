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

package daemonset

import (
	"testing"

	apps "k8s.io/api/apps/v1beta2"
	api "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/labels"
	"k8s.io/client-go/kubernetes/fake"
)

func CreateDaemonSet(name, namespace string, labelSelector map[string]string) apps.DaemonSet {
	return apps.DaemonSet{
		ObjectMeta: metaV1.ObjectMeta{Name: name, Namespace: namespace, Labels: labelSelector},
		Spec: apps.DaemonSetSpec{
			Selector: &metaV1.LabelSelector{MatchLabels: labelSelector},
		},
	}
}

func CreateService(name, namespace string, labelSelector map[string]string) api.Service {
	return api.Service{
		ObjectMeta: metaV1.ObjectMeta{Name: name, Namespace: namespace, Labels: labelSelector},
		Spec:       api.ServiceSpec{Selector: labelSelector},
	}
}

const TestNamespace = "test-namespace"

var TestLabel = map[string]string{"app": "test"}

func TestGetServicesForDeletionforDS(t *testing.T) {
	cases := []struct {
		labelSelector   labels.Selector
		DaemonSetList   *apps.DaemonSetList
		expected        *api.ServiceList
		expectedActions []string
	}{
		{
			labels.SelectorFromSet(TestLabel),
			&apps.DaemonSetList{
				Items: []apps.DaemonSet{
					CreateDaemonSet("ds-1", TestNamespace, TestLabel),
				},
			},
			&api.ServiceList{
				Items: []api.Service{
					CreateService("svc-1", TestNamespace, TestLabel),
				},
			},
			[]string{"list", "list"},
		},
		{
			labels.SelectorFromSet(TestLabel),
			&apps.DaemonSetList{
				Items: []apps.DaemonSet{
					CreateDaemonSet("ds-1", TestNamespace, TestLabel),
					CreateDaemonSet("ds-2", TestNamespace, TestLabel),
				},
			},
			&api.ServiceList{
				Items: []api.Service{
					CreateService("svc-1", TestNamespace, TestLabel),
				},
			},
			[]string{"list"},
		},
		{
			labels.SelectorFromSet(TestLabel),
			&apps.DaemonSetList{},
			&api.ServiceList{
				Items: []api.Service{
					CreateService("svc-1", TestNamespace, TestLabel),
				},
			},
			[]string{"list"},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.DaemonSetList, c.expected)

		GetServicesForDSDeletion(fakeClient, c.labelSelector, TestNamespace)

		actions := fakeClient.Actions()
		if len(actions) != len(c.expectedActions) {
			t.Errorf("Unexpected actions: %v, expected %d actions got %d", actions,
				len(c.expectedActions), len(actions))
			continue
		}

		for i, verb := range c.expectedActions {
			if actions[i].GetVerb() != verb {
				t.Errorf("Unexpected action: %+v, expected %s",
					actions[i], verb)
			}
		}
	}
}
