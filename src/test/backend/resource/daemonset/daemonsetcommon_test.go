// Copyright 2015 Google Inc. All Rights Reserved.
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

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	"k8s.io/kubernetes/pkg/apis/extensions"
	"k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset/fake"
	"k8s.io/kubernetes/pkg/labels"
)

func createDaemonSet(name, namespace string, labelSelector map[string]string) extensions.DaemonSet {
	return extensions.DaemonSet{
		ObjectMeta: api.ObjectMeta{Name: name, Namespace: namespace, Labels: labelSelector},
		Spec: extensions.DaemonSetSpec{
			Selector: &unversioned.LabelSelector{MatchLabels: labelSelector},
		},
	}
}

func createService(name, namespace string, labelSelector map[string]string) api.Service {
	return api.Service{
		ObjectMeta: api.ObjectMeta{Name: name, Namespace: namespace, Labels: labelSelector},
		Spec:       api.ServiceSpec{Selector: labelSelector},
	}
}

const testNamespace = "test-namespace"

var testLabel = map[string]string{"app": "test"}

func TestGetServicesForDeletionforDS(t *testing.T) {
	cases := []struct {
		labelSelector   labels.Selector
		DaemonSetList   *extensions.DaemonSetList
		expected        *api.ServiceList
		expectedActions []string
	}{
		{
			labels.SelectorFromSet(testLabel),
			&extensions.DaemonSetList{
				Items: []extensions.DaemonSet{
					createDaemonSet("ds-1", testNamespace, testLabel),
				},
			},
			&api.ServiceList{
				Items: []api.Service{
					createService("svc-1", testNamespace, testLabel),
				},
			},
			[]string{"list", "list"},
		},
		{
			labels.SelectorFromSet(testLabel),
			&extensions.DaemonSetList{
				Items: []extensions.DaemonSet{
					createDaemonSet("ds-1", testNamespace, testLabel),
					createDaemonSet("ds-2", testNamespace, testLabel),
				},
			},
			&api.ServiceList{
				Items: []api.Service{
					createService("svc-1", testNamespace, testLabel),
				},
			},
			[]string{"list"},
		},
		{
			labels.SelectorFromSet(testLabel),
			&extensions.DaemonSetList{},
			&api.ServiceList{
				Items: []api.Service{
					createService("svc-1", testNamespace, testLabel),
				},
			},
			[]string{"list"},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.DaemonSetList, c.expected)

		GetServicesForDSDeletion(fakeClient, c.labelSelector, testNamespace)

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
