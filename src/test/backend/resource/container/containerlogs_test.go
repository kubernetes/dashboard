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

	"github.com/kubernetes/dashboard/src/app/backend/resource/logs"
)

func TestGetLogs(t *testing.T) {

	cases := []struct {
		podId     string
		rawLogs   string
		container string
		logSelector *logs.LogViewSelector
		expected  *logs.Logs
	}{
		{"", "", "", logs.NoLogViewSelector,
			&logs.Logs{
				PodId:     "",
				LogLines:  logs.ToLogLines(""),
				Container: "",
			},
		},
		{"pod-1", "1 log1\n2 log2\n3 log3", "test", logs.NoLogViewSelector,
			&logs.Logs{
				PodId:     "pod-1",
				LogLines:  logs.LogLines{"1 log1", "2 log2", "3 log3"},
				Container: "test",
				FirstLogLineReference: logs.LogLineId{
					LogTimestamp:"1",
					LineNum:-1,
				},
				LastLogLineReference: logs.LogLineId{
					LogTimestamp:"3",
					LineNum:1,
				},
				LogViewInfo: logs.LogViewInfo{
					ReferenceLogLineId: logs.LogLineId{
						LogTimestamp:"2",
						LineNum:-1,
					},
					RelativeFrom:-1,
					RelativeTo:2},
			},
		},
	}
	for _, c := range cases {
		actual := ConstructLogs(c.podId, c.rawLogs, c.container, c.logSelector)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("constructLogs(%+v, %+v, %+v, %#v) == %#v, expected %#v",
				c.podId, c.rawLogs, c.container, c.logSelector, actual, c.expected)
		}
	}
}
