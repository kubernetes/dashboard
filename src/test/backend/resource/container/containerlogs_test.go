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
		info        string
		podId       string
		rawLogs     string
		container   string
		logSelector *logs.LogViewSelector
		expected    *logs.Logs
	}{
		{
			"return no logs if no logs are available",
			"",
			"",
			"",
			logs.AllLogViewSelector,
			&logs.Logs{
				PodId:     "",
				LogLines:  logs.ToLogLines(""),
				Container: "",
			},
		},
		{
			"return all logs if selected all logs",
			"pod-1",
			"1 log1\n2 log2\n3 log3\n4 log4\n5 log5",
			"test",
			logs.AllLogViewSelector,
			&logs.Logs{
				PodId:     "pod-1",
				LogLines:  logs.LogLines{"1 log1", "2 log2", "3 log3", "4 log4", "5 log5"},
				Container: "test",
				FirstLogLineReference: logs.LogLineId{
					LogTimestamp: "1",
					LineNum:      -1,
				},
				LastLogLineReference: logs.LogLineId{
					LogTimestamp: "5",
					LineNum:      1,
				},
				LogViewInfo: logs.LogViewInfo{
					ReferenceLogLineId: logs.LogLineId{
						LogTimestamp: "3",
						LineNum:      -1,
					},
					RelativeFrom: -2,
					RelativeTo:   3},
			},
		},
		{
			"return a slice relative to the first element",
			"pod-1",
			"1 log1\n2 log2\n3 log3\n4 log4\n5 log5",
			"test",
			&logs.LogViewSelector{
				ReferenceLogLineId: logs.OldestLogLineId,
				RelativeFrom:       1,
				RelativeTo:         3,
			},
			&logs.Logs{
				PodId:     "pod-1",
				LogLines:  logs.LogLines{"2 log2", "3 log3"},
				Container: "test",
				FirstLogLineReference: logs.LogLineId{
					LogTimestamp: "2",
					LineNum:      -1,
				},
				LastLogLineReference: logs.LogLineId{
					LogTimestamp: "3",
					LineNum:      -1,
				},
				LogViewInfo: logs.LogViewInfo{
					ReferenceLogLineId: logs.LogLineId{
						LogTimestamp: "3",
						LineNum:      -1,
					},
					RelativeFrom: -1,
					RelativeTo:   1},
			},
		},
		{
			"return a slice relative to the last element",
			"pod-1",
			"1 log1\n2 log2\n3 log3\n4 log4\n5 log5",
			"test",
			&logs.LogViewSelector{
				ReferenceLogLineId: logs.NewestLogLineId,
				RelativeFrom:       -3,
				RelativeTo:         -1,
			},
			&logs.Logs{
				PodId:     "pod-1",
				LogLines:  logs.LogLines{"2 log2", "3 log3"},
				Container: "test",
				FirstLogLineReference: logs.LogLineId{
					LogTimestamp: "2",
					LineNum:      -1,
				},
				LastLogLineReference: logs.LogLineId{
					LogTimestamp: "3",
					LineNum:      -1,
				},
				LogViewInfo: logs.LogViewInfo{
					ReferenceLogLineId: logs.LogLineId{
						LogTimestamp: "3",
						LineNum:      -1,
					},
					RelativeFrom: -1,
					RelativeTo:   1},
			},
		},
		{
			"return a slice relative to an arbitrary element",
			"pod-1",
			"1 log1\n2 log2\n3 log3\n4 log4\n5 log5",
			"test",
			&logs.LogViewSelector{
				ReferenceLogLineId: logs.LogLineId{
					LogTimestamp: logs.LogTimestamp("4"),
					LineNum:      1,
				},
				RelativeFrom: -2,
				RelativeTo:   0,
			},
			&logs.Logs{
				PodId:     "pod-1",
				LogLines:  logs.LogLines{"2 log2", "3 log3"},
				Container: "test",
				FirstLogLineReference: logs.LogLineId{
					LogTimestamp: "2",
					LineNum:      -1,
				},
				LastLogLineReference: logs.LogLineId{
					LogTimestamp: "3",
					LineNum:      -1,
				},
				LogViewInfo: logs.LogViewInfo{
					ReferenceLogLineId: logs.LogLineId{
						LogTimestamp: "3",
						LineNum:      -1,
					},
					RelativeFrom: -1,
					RelativeTo:   1},
			},
		},
		{
			"return a slice outside of log bounds - try to keep requested size",
			"pod-1",
			"1 log1\n2 log2\n3 log3\n4 log4\n5 log5",
			"test",
			&logs.LogViewSelector{
				ReferenceLogLineId: logs.LogLineId{
					LogTimestamp: logs.LogTimestamp("4"),
					LineNum:      1,
				},
				RelativeFrom: 1,
				RelativeTo:   3,
			},
			&logs.Logs{
				PodId:     "pod-1",
				LogLines:  logs.LogLines{"4 log4", "5 log5"},
				Container: "test",
				FirstLogLineReference: logs.LogLineId{
					LogTimestamp: "4",
					LineNum:      -1,
				},
				LastLogLineReference: logs.LogLineId{
					LogTimestamp: "5",
					LineNum:      1,
				},
				LogViewInfo: logs.LogViewInfo{
					ReferenceLogLineId: logs.LogLineId{
						LogTimestamp: "3",
						LineNum:      -1,
					},
					RelativeFrom: 1,
					RelativeTo:   3},
			},
		},
		{
			"return a slice outside of log bounds - try to keep requested size",
			"pod-1",
			"1 log1\n2 log2\n3 log3\n4 log4\n5 log5",
			"test",
			&logs.LogViewSelector{
				ReferenceLogLineId: logs.LogLineId{
					LogTimestamp: logs.LogTimestamp("4"),
					LineNum:      1,
				},
				RelativeFrom: -50,
				RelativeTo:   -48,
			},
			&logs.Logs{
				PodId:     "pod-1",
				LogLines:  logs.LogLines{"1 log1", "2 log2"},
				Container: "test",
				FirstLogLineReference: logs.LogLineId{
					LogTimestamp: "1",
					LineNum:      -1,
				},
				LastLogLineReference: logs.LogLineId{
					LogTimestamp: "2",
					LineNum:      -1,
				},
				LogViewInfo: logs.LogViewInfo{
					ReferenceLogLineId: logs.LogLineId{
						LogTimestamp: "3",
						LineNum:      -1,
					},
					RelativeFrom: -2,
					RelativeTo:   0},
			},
		},
		{
			"be able to handle duplicate timestamps",
			"pod-1",
			"1 log1\n1 log2\n1 log3\n1 log4\n1 log5",
			"test",
			&logs.LogViewSelector{
				ReferenceLogLineId: logs.LogLineId{
					LogTimestamp: logs.LogTimestamp("1"),
					LineNum:      2, // this means element with actual index 1.
				},
				RelativeFrom: 0,
				RelativeTo:   2, // request indices 1, 2
			},
			&logs.Logs{
				PodId:     "pod-1",
				LogLines:  logs.LogLines{"1 log2", "1 log3"},
				Container: "test",
				FirstLogLineReference: logs.LogLineId{
					LogTimestamp: "1",
					LineNum:      2,
				},
				LastLogLineReference: logs.LogLineId{
					LogTimestamp: "1",
					LineNum:      3,
				},
				LogViewInfo: logs.LogViewInfo{
					ReferenceLogLineId: logs.LogLineId{
						LogTimestamp: "1",
						LineNum:      3,
					},
					RelativeFrom: -1,
					RelativeTo:   1},
			},
		},
	}
	for _, c := range cases {
		actual := ConstructLogs(c.podId, c.rawLogs, c.container, c.logSelector)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("Test Case: %s.\nReceived: %#v \nExpected: %#v\n\n", c.info, actual, c.expected)
		}
	}
}
