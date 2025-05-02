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

package replicaset

import (
	"reflect"
	"testing"

	apps "k8s.io/api/apps/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/types"
)

func TestToReplicaSet(t *testing.T) {
	cases := []struct {
		replicaSet *apps.ReplicaSet
		podInfo    *common.PodInfo
		expected   ReplicaSet
	}{
		{
			&apps.ReplicaSet{ObjectMeta: metaV1.ObjectMeta{Name: "replica-set"}},
			&common.PodInfo{Running: 1, Warnings: []common.Event{}},
			ReplicaSet{
				ObjectMeta: types.ObjectMeta{Name: "replica-set"},
				TypeMeta:   types.TypeMeta{Kind: types.ResourceKindReplicaSet, Scalable: true},
				Pods:       common.PodInfo{Running: 1, Warnings: []common.Event{}},
			},
		},
	}

	for _, c := range cases {
		actual := ToReplicaSet(c.replicaSet, c.podInfo)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("ToReplicaSet(%#v, %#v) == \ngot %#v, \nexpected %#v", c.replicaSet,
				c.podInfo, actual, c.expected)
		}
	}
}
