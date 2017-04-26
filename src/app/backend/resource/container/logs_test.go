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

var log1 = logs.LogLine{
	Timestamp: "1",
	Content:   "log1",
}

var log2 = logs.LogLine{
	Timestamp: "2",
	Content:   "log2",
}

var log3 = logs.LogLine{
	Timestamp: "3",
	Content:   "log3",
}

var log4 = logs.LogLine{
	Timestamp: "4",
	Content:   "log4",
}

var log5 = logs.LogLine{
	Timestamp: "5",
	Content:   "log5",
}

func TestGetLogs(t *testing.T) {

	cases := []struct {
		info        string
		podId       string
		rawLogs     string
		container   string
		logSelector *logs.Selection
		expected    *logs.LogDetails
	}{
		{
			"return no logs if no logs are available",
			"",
			"",
			"",
			logs.AllSelection,
			&logs.LogDetails{
				Info: logs.LogInfo{
					PodName:       "",
					ContainerName: "",
				},
				LogLines: logs.ToLogLines(""),
			},
		},
		{
			"return all logs if selected all logs",
			"pod-1",
			"1 log1\n2 log2\n3 log3\n4 log4\n5 log5",
			"test",
			logs.AllSelection,
			&logs.LogDetails{
				Info: logs.LogInfo{
					PodName:       "pod-1",
					ContainerName: "test",
					FromDate:      "1",
					ToDate:        "5",
				},
				LogLines: logs.LogLines{log1, log2, log3, log4, log5},
				Selection: logs.Selection{
					ReferencePoint: logs.LogLineId{
						LogTimestamp: "3",
						LineNum:      -1,
					},
					OffsetFrom: -2,
					OffsetTo:   3},
			},
		},
		{
			"return a slice relative to the first element",
			"pod-1",
			"1 log1\n2 log2\n3 log3\n4 log4\n5 log5",
			"test",
			&logs.Selection{
				ReferencePoint: logs.OldestLogLineId,
				OffsetFrom:     1,
				OffsetTo:       3,
			},
			&logs.LogDetails{
				Info: logs.LogInfo{
					PodName:       "pod-1",
					ContainerName: "test",
					FromDate:      "2",
					ToDate:        "3",
				},
				LogLines: logs.LogLines{log2, log3},
				Selection: logs.Selection{
					ReferencePoint: logs.LogLineId{
						LogTimestamp: "3",
						LineNum:      -1,
					},
					OffsetFrom: -1,
					OffsetTo:   1},
			},
		},
		{
			"return a slice relative to the last element",
			"pod-1",
			"1 log1\n2 log2\n3 log3\n4 log4\n5 log5",
			"test",
			&logs.Selection{
				ReferencePoint: logs.NewestLogLineId,
				OffsetFrom:     -3,
				OffsetTo:       -1,
			},
			&logs.LogDetails{
				Info: logs.LogInfo{
					PodName:       "pod-1",
					ContainerName: "test",
					FromDate:      "2",
					ToDate:        "3",
				},
				LogLines: logs.LogLines{log2, log3},
				Selection: logs.Selection{
					ReferencePoint: logs.LogLineId{
						LogTimestamp: "3",
						LineNum:      -1,
					},
					OffsetFrom: -1,
					OffsetTo:   1},
			},
		},
		{
			"return a slice relative to an arbitrary element",
			"pod-1",
			"1 log1\n2 log2\n3 log3\n4 log4\n5 log5",
			"test",
			&logs.Selection{
				ReferencePoint: logs.LogLineId{
					LogTimestamp: logs.LogTimestamp("4"),
					LineNum:      1,
				},
				OffsetFrom: -2,
				OffsetTo:   0,
			},
			&logs.LogDetails{
				Info: logs.LogInfo{
					PodName:       "pod-1",
					ContainerName: "test",
					FromDate:      "2",
					ToDate:        "3",
				},
				LogLines: logs.LogLines{log2, log3},
				Selection: logs.Selection{
					ReferencePoint: logs.LogLineId{
						LogTimestamp: "3",
						LineNum:      -1,
					},
					OffsetFrom: -1,
					OffsetTo:   1},
			},
		},
		{
			"return a slice outside of log bounds - try to keep requested size",
			"pod-1",
			"1 log1\n2 log2\n3 log3\n4 log4\n5 log5",
			"test",
			&logs.Selection{
				ReferencePoint: logs.LogLineId{
					LogTimestamp: logs.LogTimestamp("4"),
					LineNum:      1,
				},
				OffsetFrom: 1,
				OffsetTo:   3,
			},
			&logs.LogDetails{
				Info: logs.LogInfo{
					PodName:       "pod-1",
					ContainerName: "test",
					FromDate:      "4",
					ToDate:        "5",
				},
				LogLines: logs.LogLines{log4, log5},
				Selection: logs.Selection{
					ReferencePoint: logs.LogLineId{
						LogTimestamp: "3",
						LineNum:      -1,
					},
					OffsetFrom: 1,
					OffsetTo:   3},
			},
		},
		{
			"return a slice outside of log bounds - try to keep requested size",
			"pod-1",
			"1 log1\n2 log2\n3 log3\n4 log4\n5 log5",
			"test",
			&logs.Selection{
				ReferencePoint: logs.LogLineId{
					LogTimestamp: logs.LogTimestamp("4"),
					LineNum:      1,
				},
				OffsetFrom: -50,
				OffsetTo:   -48,
			},
			&logs.LogDetails{
				Info: logs.LogInfo{
					PodName:       "pod-1",
					ContainerName: "test",
					FromDate:      "1",
					ToDate:        "2",
				},
				LogLines: logs.LogLines{log1, log2},
				Selection: logs.Selection{
					ReferencePoint: logs.LogLineId{
						LogTimestamp: "3",
						LineNum:      -1,
					},
					OffsetFrom: -2,
					OffsetTo:   0},
			},
		},
		{
			"be able to handle duplicate timestamps",
			"pod-1",
			"1 log1\n1 log2\n1 log3\n1 log4\n1 log5",
			"test",
			&logs.Selection{
				ReferencePoint: logs.LogLineId{
					LogTimestamp: logs.LogTimestamp("1"),
					LineNum:      2, // this means element with actual index 1.
				},
				OffsetFrom: 0,
				OffsetTo:   2, // request indices 1, 2
			},
			&logs.LogDetails{
				Info: logs.LogInfo{
					PodName:       "pod-1",
					ContainerName: "test",
					FromDate:      "1",
					ToDate:        "1",
				},
				LogLines: logs.LogLines{logs.LogLine{
					Timestamp: "1",
					Content:   "log2",
				}, logs.LogLine{
					Timestamp: "1",
					Content:   "log3",
				}},
				Selection: logs.Selection{
					ReferencePoint: logs.LogLineId{
						LogTimestamp: "1",
						LineNum:      3,
					},
					OffsetFrom: -1,
					OffsetTo:   1},
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
