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
	"k8s.io/kubernetes/pkg/client/unversioned/testclient"
)

func TestDeleteDaemonSetServices(t *testing.T) {
	cases := []struct {
		namespace, name string
		DaemonSet       *extensions.DaemonSet
		DaemonSetList   *extensions.DaemonSetList
		serviceList     *api.ServiceList
		expectedActions []string
	}{
		{
			"test-namespace", "test-name",
			&extensions.DaemonSet{
				Spec: extensions.DaemonSetSpec{
					Selector: &unversioned.LabelSelector{
						MatchLabels: map[string]string{"app": "test"},
					},
				},
			},
			&extensions.DaemonSetList{
				Items: []extensions.DaemonSet{
					{Spec: extensions.DaemonSetSpec{
						Selector: &unversioned.LabelSelector{
							MatchLabels: map[string]string{"app": "test"},
						},
					}},
				},
			},
			&api.ServiceList{
				Items: []api.Service{
					{Spec: api.ServiceSpec{Selector: map[string]string{"app": "test"}}},
				},
			},
			[]string{"get", "list", "list", "delete"},
		},
		{
			"test-namespace", "test-name",
			&extensions.DaemonSet{
				Spec: extensions.DaemonSetSpec{
					Selector: &unversioned.LabelSelector{
						MatchLabels: map[string]string{"app": "test"},
					},
				}},
			&extensions.DaemonSetList{
				Items: []extensions.DaemonSet{
					{Spec: extensions.DaemonSetSpec{
						Selector: &unversioned.LabelSelector{
							MatchLabels: map[string]string{"app": "test"},
						},
					}},
					{Spec: extensions.DaemonSetSpec{
						Selector: &unversioned.LabelSelector{
							MatchLabels: map[string]string{"app": "test"},
						},
					}},
				},
			},
			&api.ServiceList{
				Items: []api.Service{
					{Spec: api.ServiceSpec{Selector: map[string]string{"app": "test"}}},
				},
			},
			[]string{"get", "list"},
		},
		{
			"test-namespace", "test-name",
			&extensions.DaemonSet{
				Spec: extensions.DaemonSetSpec{
					Selector: &unversioned.LabelSelector{
						MatchLabels: map[string]string{"app": "test"},
					},
				}},
			&extensions.DaemonSetList{
				Items: []extensions.DaemonSet{
					{Spec: extensions.DaemonSetSpec{
						Selector: &unversioned.LabelSelector{
							MatchLabels: map[string]string{"app": "test"},
						},
					}},
				},
			},
			&api.ServiceList{},
			[]string{"get", "list", "list"},
		},
	}

	for _, c := range cases {
		fakeClient := testclient.NewSimpleFake(c.DaemonSet,
			c.DaemonSetList, c.serviceList)

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
