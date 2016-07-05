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

package job

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/apis/batch"
)

func TestGetJobPodInfo(t *testing.T) {
	var jobCompletions int32 = 4
	cases := []struct {
		controller *batch.Job
		pods       []api.Pod
		expected   common.PodInfo
	}{
		{
			&batch.Job{
				Status: batch.JobStatus{
					Active: 5,
				},
				Spec: batch.JobSpec{
					Completions: &jobCompletions,
				},
			},
			[]api.Pod{
				{
					Status: api.PodStatus{
						Phase: api.PodRunning,
					},
				},
			},
			common.PodInfo{
				Current:  5,
				Desired:  4,
				Running:  1,
				Pending:  0,
				Failed:   0,
				Warnings: []common.Event{},
			},
		},
	}

	for _, c := range cases {
		actual := getPodInfo(c.controller, c.pods)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getJobPodInfo(%#v, %#v) == \n%#v\nexpected \n%#v\n",
				c.controller, c.pods, actual, c.expected)
		}
	}
}
