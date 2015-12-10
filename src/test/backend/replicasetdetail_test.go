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

package main

import (
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/client/unversioned/testclient"
	"testing"
)

func TestUpdateReplicasCount(t *testing.T) {
	cases := []struct {
		namespace, replicaSetName string
		replicaSetSpec            *ReplicaSetSpec
		expected                  int
		expectedActions           []string
	}{
		{
			"default-ns", "replicaSet-1",
			&ReplicaSetSpec{Replicas: 5},
			5,
			[]string{"get", "update"},
		},
	}

	for _, c := range cases {
		replicationCtrl := &api.ReplicationController{}
		fakeClient := testclient.NewSimpleFake(replicationCtrl)

		UpdateReplicasCount(fakeClient, c.namespace, c.replicaSetName, c.replicaSetSpec)

		actual := fakeClient.Actions()[1].(testclient.UpdateAction).GetObject().(*api.ReplicationController)
		if actual.Spec.Replicas != c.expected {
			t.Errorf("UpdateReplicasCount(client, %+v, %+v, %+v). Got %+v, expected %+v",
				c.namespace, c.replicaSetName, c.replicaSetSpec, actual.Spec.Replicas, c.expected)
		}

		actions := fakeClient.Actions()
		if len(actions) != len(c.expectedActions) {
			t.Errorf("Unexpected actions: %v, expected %d actions got %d", actions,
				len(c.expectedActions), len(actions))
			continue
		}

		for i, verb := range c.expectedActions {
			if actions[i].GetResource() != "replicationcontrollers" {
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
