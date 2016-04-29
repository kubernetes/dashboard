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

package replicaset

import (
	"reflect"
	"testing"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/apis/extensions"

	"github.com/kubernetes/dashboard/resource/common"
)

func TestGetReplicaSetPodInfo(t *testing.T) {
	cases := []struct {
		controller *extensions.ReplicaSet
		pods       []api.Pod
		expected   common.ControllerPodInfo
	}{
		{
			&extensions.ReplicaSet{
				Status: extensions.ReplicaSetStatus{
					Replicas: 5,
				},
				Spec: extensions.ReplicaSetSpec{
					Replicas: 4,
				},
			},
			[]api.Pod{
				{
					Status: api.PodStatus{
						Phase: api.PodRunning,
					},
				},
			},
			common.ControllerPodInfo{
				Current: 5,
				Desired: 4,
				Running: 1,
				Pending: 0,
				Failed:  0,
			},
		},
	}

	for _, c := range cases {
		actual := getPodInfo(c.controller, c.pods)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getReplicaSetPodInfo(%#v, %#v) == \n%#v\nexpected \n%#v\n",
				c.controller, c.pods, actual, c.expected)
		}
	}
}
