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

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
)

func TestToReplicaSet(t *testing.T) {
	cases := []struct {
		replicaSet *extensions.ReplicaSet
		podInfo    *common.PodInfo
		expected   ReplicaSet
	}{
		{
			&extensions.ReplicaSet{ObjectMeta: metaV1.ObjectMeta{Name: "replica-set"}},
			&common.PodInfo{Running: 1, Warnings: []common.Event{}},
			ReplicaSet{
				ObjectMeta: common.ObjectMeta{Name: "replica-set"},
				TypeMeta:   common.TypeMeta{Kind: common.ResourceKindReplicaSet},
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
