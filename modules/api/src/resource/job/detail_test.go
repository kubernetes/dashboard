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

package job

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"

	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	batch "k8s.io/api/batch/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
)

func createJob(name, namespace string, jobCompletions int32, labelSelector map[string]string) *batch.Job {
	var parallelism int32 = 0
	return &batch.Job{
		ObjectMeta: metaV1.ObjectMeta{
			Name: name, Namespace: namespace, Labels: labelSelector,
		},
		Spec: batch.JobSpec{
			Selector:    &metaV1.LabelSelector{MatchLabels: labelSelector},
			Completions: &jobCompletions,
			Parallelism: &parallelism,
		},
	}
}

func TestGetJobDetail(t *testing.T) {
	var jobCompletions int32
	var parallelism int32

	cases := []struct {
		namespace, name string
		expectedActions []string
		job             *batch.Job
		expected        *JobDetail
	}{
		{
			"ns-1", "job-1",
			[]string{"get", "list"},
			createJob("job-1", "ns-1", jobCompletions, map[string]string{"app": "test"}),
			&JobDetail{
				Job: Job{
					ObjectMeta: api.ObjectMeta{Name: "job-1", Namespace: "ns-1",
						Labels: map[string]string{"app": "test"}},
					TypeMeta: api.TypeMeta{Kind: api.ResourceKindJob},
					Pods: common.PodInfo{
						Warnings: []common.Event{},
						Desired:  &jobCompletions,
					},
					Parallelism: &jobCompletions,
					JobStatus: JobStatus{
						Status:  "Running",
						Message: "",
					},
				},
				Completions: &parallelism,
				Errors:      []error{},
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.job)
		dataselect.DefaultDataSelectWithMetrics.MetricQuery = dataselect.NoMetrics
		actual, _ := GetJobDetail(fakeClient, c.namespace, c.name)

		actions := fakeClient.Actions()
		if len(actions) != len(c.expectedActions) {
			t.Errorf("Unexpected actions: %v, expected %d actions got %d", actions, len(c.expectedActions), len(actions))
			continue
		}

		for i, verb := range c.expectedActions {
			if actions[i].GetVerb() != verb {
				t.Errorf("Unexpected action: %+v, expected %s",
					actions[i], verb)
			}
		}

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("TestGetJobDetail() == \ngot: %#v, \nexpected %#v", actual, c.expected)
		}
	}
}
