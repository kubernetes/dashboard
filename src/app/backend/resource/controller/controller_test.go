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

package controller

import (
	"reflect"
	"testing"

	"k8s.io/api/core/v1"
	meta "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestGetPodNames(t *testing.T) {
	cases := []struct {
		pods          []v1.Pod
		expectedNames []string
	}{
		{
			pods:          nil,
			expectedNames: []string{},
		},
		{
			pods:          []v1.Pod{newPod("a"), newPod("b")},
			expectedNames: []string{"a", "b"},
		},
	}

	for _, c := range cases {
		actual := getPodNames(c.pods)
		if !reflect.DeepEqual(actual, c.expectedNames) {
			t.Errorf("GetPodNames(%+v) == %+v, expected %+v",
				c.pods, actual, c.expectedNames)
		}
	}

}

func newPod(name string) v1.Pod {
	return v1.Pod{ObjectMeta: meta.ObjectMeta{Name: name}}
}
