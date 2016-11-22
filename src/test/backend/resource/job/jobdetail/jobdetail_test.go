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

package jobdetail

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	"k8s.io/kubernetes/pkg/apis/batch"
	"k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset/fake"
	"k8s.io/kubernetes/pkg/client/restclient"
)

type FakeHeapsterClient struct {
}

func (c FakeHeapsterClient) Get(path string) client.RequestInterface {
	return &restclient.Request{}
}

func createJob(name, namespace string, labelSelector map[string]string) *batch.Job {
	var jobCompletions int32
	var parallelism int32

	return &batch.Job{
		ObjectMeta: api.ObjectMeta{
			Name: name, Namespace: namespace, Labels: labelSelector,
		},
		Spec: batch.JobSpec{
			Selector:    &unversioned.LabelSelector{MatchLabels: labelSelector},
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
			[]string{"get", "get", "list", "list", "list", "get", "list", "list"},
			createJob("job-1", "ns-1", map[string]string{"app": "test"}),
			&JobDetail{
				ObjectMeta: common.ObjectMeta{Name: "job-1", Namespace: "ns-1",
					Labels: map[string]string{"app": "test"}},
				TypeMeta: common.TypeMeta{Kind: common.ResourceKindJob},
				PodInfo:  common.PodInfo{Warnings: []common.Event{}},
				PodList: pod.PodList{
					Pods:              []pod.Pod{},
					CumulativeMetrics: make([]metric.Metric, 0),
				},
				EventList:   common.EventList{Events: []common.Event{}},
				Parallelism: &jobCompletions,
				Completions: &parallelism,
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.job)
		fakeHeapsterClient := FakeHeapsterClient{}

		dataselect.DefaultDataSelectWithMetrics.MetricQuery = dataselect.NoMetrics
		actual, _ := GetJobDetail(fakeClient, fakeHeapsterClient, c.namespace, c.name)

		actions := fakeClient.Actions()
		if len(actions) != len(c.expectedActions) {
			t.Errorf("Unexpected actions: %v, expected %d actions got %d", actions,
				len(c.expectedActions), len(actions))
			continue
		}

		for i, verb := range c.expectedActions {
			if actions[i].GetVerb() != verb {
				t.Errorf("Unexpected action: %+v, expected %s",
					actions[i], verb)
			}
		}

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetEvents(client,heapsterClient,%#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.namespace, c.name, actual, c.expected)
		}
	}
}
