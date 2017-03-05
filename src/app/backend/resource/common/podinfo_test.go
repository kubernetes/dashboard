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

package common

import (
	"reflect"
	"testing"

	api "k8s.io/client-go/pkg/api/v1"
)

func TestGetPodInfo(t *testing.T) {
	cases := []struct {
		current, desired int32
		pods             []api.Pod
		expected         PodInfo
	}{
		{
			5,
			4,
			[]api.Pod{
				{
					Status: api.PodStatus{
						Phase: api.PodRunning,
					},
				},
			},
			PodInfo{
				Current:  5,
				Desired:  4,
				Running:  1,
				Pending:  0,
				Failed:   0,
				Warnings: make([]Event, 0),
			},
		},
	}

	for _, c := range cases {
		actual := GetPodInfo(c.current, c.desired, c.pods)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getPodInfo(%#v, %#v, %#v) == \n%#v\nexpected \n%#v\n",
				c.current, c.desired, c.pods, actual, c.expected)
		}
	}
}
