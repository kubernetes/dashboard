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

package node

import (
	"reflect"
	"testing"

	"k8s.io/kubernetes/pkg/api"
)

func TestGetNodeByName(t *testing.T) {
	cases := []struct {
		nodes    []api.Node
		nodeName string
		expected *api.Node
	}{
		{[]api.Node{}, "test-node", nil},
		{
			[]api.Node{
				{ObjectMeta: api.ObjectMeta{Name: "test-node-1"}},
				{ObjectMeta: api.ObjectMeta{Name: "test-node-2"}},
			},
			"test-node-1",
			&api.Node{ObjectMeta: api.ObjectMeta{Name: "test-node-1"}},
		},
		{
			[]api.Node{
				{ObjectMeta: api.ObjectMeta{Name: "test-node-1"}},
				{ObjectMeta: api.ObjectMeta{Name: "test-node-2"}},
			},
			"test-node-3",
			nil,
		},
	}

	for _, c := range cases {
		actual := GetNodeByName(c.nodes, c.nodeName)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetNodeByName(%+v, %+v) == %+v, expected %+v",
				c.nodes, c.nodeName, actual, c.expected)
		}
	}
}
