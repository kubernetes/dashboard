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

package daemonsetdetail

import (
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	"k8s.io/kubernetes/pkg/apis/extensions"
	"k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset/fake"

	"testing"
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

func TestDeleteDaemonSetServices(t *testing.T) {
	cases := []struct {
		namespace, name string
		DaemonSetList   *extensions.DaemonSetList
		serviceList     *api.ServiceList
		expectedActions []string
	}{
		{
			testNamespace, "ds-1",
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
			[]string{"get", "list", "list", "delete"},
		},
		{
			testNamespace, "ds-1",
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
			[]string{"get", "list"},
		},
		{
			testNamespace, "ds-1",
			&extensions.DaemonSetList{
				Items: []extensions.DaemonSet{
					createDaemonSet("ds-1", testNamespace, testLabel),
				},
			},
			&api.ServiceList{},
			[]string{"get", "list", "list"},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.DaemonSetList, c.serviceList)

		DeleteDaemonSetServices(fakeClient, c.namespace, c.name)

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
