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

package replicationcontroller

import (
	"reflect"
	"testing"

	api "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/labels"
	"k8s.io/client-go/kubernetes/fake"
)

func TestToLabelSelector(t *testing.T) {
	selector, _ := metaV1.LabelSelectorAsSelector(
		&metaV1.LabelSelector{MatchLabels: map[string]string{"app": "test"}})

	cases := []struct {
		selector map[string]string
		expected labels.Selector
	}{
		{
			map[string]string{},
			labels.SelectorFromSet(nil),
		},
		{
			map[string]string{"app": "test"},
			selector,
		},
	}

	for _, c := range cases {
		actual, _ := toLabelSelector(c.selector)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("toLabelSelector(%#v) == \n%#v\nexpected \n%#v\n",
				c.selector, actual, c.expected)
		}
	}
}

func TestGetServicesForDeletion(t *testing.T) {
	labelSelector := map[string]string{"app": "test"}

	cases := []struct {
		labelSelector             labels.Selector
		replicationControllerList *api.ReplicationControllerList
		expected                  *api.ServiceList
		expectedActions           []string
	}{
		{
			labels.SelectorFromSet(labelSelector),
			&api.ReplicationControllerList{
				Items: []api.ReplicationController{
					{
						ObjectMeta: metaV1.ObjectMeta{Name: "rc-1", Namespace: "ns-1",
							Labels: labelSelector},
						Spec: api.ReplicationControllerSpec{Selector: labelSelector},
					},
				},
			},
			&api.ServiceList{
				Items: []api.Service{
					{
						ObjectMeta: metaV1.ObjectMeta{Name: "svc-1", Namespace: "ns-1",
							Labels: labelSelector},
						Spec: api.ServiceSpec{Selector: labelSelector},
					},
				},
			},
			[]string{"list", "list"},
		},
		{
			labels.SelectorFromSet(labelSelector),
			&api.ReplicationControllerList{
				Items: []api.ReplicationController{
					{
						ObjectMeta: metaV1.ObjectMeta{Name: "rc-1", Namespace: "ns-1",
							Labels: labelSelector},
						Spec: api.ReplicationControllerSpec{Selector: labelSelector},
					},
					{
						ObjectMeta: metaV1.ObjectMeta{Name: "rc-2", Namespace: "ns-1",
							Labels: labelSelector},
						Spec: api.ReplicationControllerSpec{Selector: labelSelector},
					},
				},
			},
			&api.ServiceList{
				Items: []api.Service{
					{
						ObjectMeta: metaV1.ObjectMeta{Name: "svc-1", Namespace: "ns-1",
							Labels: labelSelector},
						Spec: api.ServiceSpec{Selector: labelSelector},
					},
				},
			},
			[]string{"list"},
		},
		{
			labels.SelectorFromSet(labelSelector),
			&api.ReplicationControllerList{},
			&api.ServiceList{
				Items: []api.Service{
					{
						ObjectMeta: metaV1.ObjectMeta{Name: "svc-1", Namespace: "ns-1",
							Labels: labelSelector},
						Spec: api.ServiceSpec{Selector: labelSelector},
					},
				},
			},
			[]string{"list"},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.replicationControllerList, c.expected)

		getServicesForDeletion(fakeClient, c.labelSelector, "ns-1")

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
