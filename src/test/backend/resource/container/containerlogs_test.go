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

package container

import (
	"reflect"
	"testing"

	"k8s.io/kubernetes/pkg/api/unversioned"
)

func TestGetLogs(t *testing.T) {

	cases := []struct {
		podId     string
		sinceTime unversioned.Time
		rawLogs   string
		container string
		expected  *Logs
	}{
		{"", unversioned.Time{}, "", "",
			&Logs{
				PodId:     "",
				SinceTime: unversioned.Time{},
				Logs:      []string{""},
				Container: "",
			},
		},
		{"pod-1", unversioned.Time{}, "log1\nlog2\nlog3", "test",
			&Logs{
				PodId:     "pod-1",
				SinceTime: unversioned.Time{},
				Logs:      []string{"log1", "log2", "log3"},
				Container: "test",
			},
		},
	}
	for _, c := range cases {
		actual := ConstructLogs(c.podId, c.sinceTime, c.rawLogs, c.container)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("constructLogs(%+v, %+v, %+v, %+v) == %#v, expected %#v",
				c.podId, c.sinceTime, c.rawLogs, c.container, actual, c.expected)
		}
	}
}
