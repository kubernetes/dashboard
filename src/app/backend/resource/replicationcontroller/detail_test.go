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
	"testing"

	"k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
	core "k8s.io/client-go/testing"
)

func TestUpdateReplicasCount(t *testing.T) {
	expectedReplicas := int32(5)
	cases := []struct {
		namespace, replicationControllerName string
		replicationControllerSpec            *ReplicationControllerSpec
		replicationController                *v1.ReplicationController
		expected                             *int32
		expectedActions                      []string
	}{
		{
			"ns-1", "rc-1",
			&ReplicationControllerSpec{Replicas: 5},
			&v1.ReplicationController{ObjectMeta: metaV1.ObjectMeta{
				Name: "rc-1", Namespace: "ns-1", Labels: map[string]string{},
			}},
			&expectedReplicas,
			[]string{"get", "update"},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.replicationController)

		UpdateReplicasCount(fakeClient, c.namespace, c.replicationControllerName, c.replicationControllerSpec)

		actual := fakeClient.Actions()[1].(core.UpdateActionImpl).GetObject().(*v1.ReplicationController)
		if *actual.Spec.Replicas != *c.expected {
			t.Errorf("UpdateReplicasCount(client, %+v, %+v, %+v). Got %+v, expected %+v",
				c.namespace, c.replicationControllerName, c.replicationControllerSpec, *actual.Spec.Replicas, *c.expected)
		}

		actions := fakeClient.Actions()
		if len(actions) != len(c.expectedActions) {
			t.Errorf("Unexpected actions: %v, expected %d actions got %d", actions,
				len(c.expectedActions), len(actions))
			continue
		}

		for i, verb := range c.expectedActions {
			if actions[i].GetResource().Resource != "replicationcontrollers" {
				t.Errorf("Unexpected action: %+v, expected %s-replicationController",
					actions[i], verb)
			}
			if actions[i].GetVerb() != verb {
				t.Errorf("Unexpected action: %+v, expected %s-replicationController",
					actions[i], verb)
			}
		}
	}
}
