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

package workload

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/daemonset/daemonsetlist"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/deployment"
	"github.com/kubernetes/dashboard/src/app/backend/resource/job/joblist"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicaset"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicaset/replicasetlist"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicationcontroller"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicationcontroller/replicationcontrollerlist"
	"github.com/kubernetes/dashboard/src/app/backend/resource/statefulset/statefulsetlist"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	"k8s.io/kubernetes/pkg/apis/apps"
	"k8s.io/kubernetes/pkg/apis/batch"
	"k8s.io/kubernetes/pkg/apis/extensions"
)

func TestGetWorkloadsFromChannels(t *testing.T) {
	var jobCompletions int32
	cases := []struct {
		k8sRs          extensions.ReplicaSetList
		k8sJobs        batch.JobList
		k8sDaemonSet   extensions.DaemonSetList
		k8sDeployment  extensions.DeploymentList
		k8sRc          api.ReplicationControllerList
		k8sPod         api.PodList
		k8sStatefulSet apps.StatefulSetList
		rcs            []replicationcontroller.ReplicationController
		rs             []replicaset.ReplicaSet
		jobs           []joblist.Job
		daemonset      []daemonsetlist.DaemonSet
		deployment     []deployment.Deployment
		pod            []pod.Pod
		statefulSet    []statefulsetlist.StatefulSet
	}{
		{
			extensions.ReplicaSetList{},
			batch.JobList{},
			extensions.DaemonSetList{},
			extensions.DeploymentList{},
			api.ReplicationControllerList{},
			api.PodList{},
			apps.StatefulSetList{},
			[]replicationcontroller.ReplicationController{},
			[]replicaset.ReplicaSet{},
			[]joblist.Job{},
			[]daemonsetlist.DaemonSet{},
			[]deployment.Deployment{},
			[]pod.Pod{},
			[]statefulsetlist.StatefulSet{},
		},
		{
			extensions.ReplicaSetList{
				Items: []extensions.ReplicaSet{
					{
						ObjectMeta: api.ObjectMeta{Name: "rs-name"},
						Spec:       extensions.ReplicaSetSpec{Selector: &unversioned.LabelSelector{}},
					}},
			},
			batch.JobList{
				Items: []batch.Job{
					{
						ObjectMeta: api.ObjectMeta{Name: "job-name"},
						Spec: batch.JobSpec{
							Selector:    &unversioned.LabelSelector{},
							Completions: &jobCompletions,
						},
					}},
			},
			extensions.DaemonSetList{
				Items: []extensions.DaemonSet{
					{
						ObjectMeta: api.ObjectMeta{Name: "ds-name"},
						Spec:       extensions.DaemonSetSpec{Selector: &unversioned.LabelSelector{}},
					}},
			},
			extensions.DeploymentList{
				Items: []extensions.Deployment{
					{
						ObjectMeta: api.ObjectMeta{Name: "deployment-name"},
						Spec:       extensions.DeploymentSpec{Selector: &unversioned.LabelSelector{}},
					}},
			},
			api.ReplicationControllerList{
				Items: []api.ReplicationController{{
					ObjectMeta: api.ObjectMeta{Name: "rc-name"},
					Spec: api.ReplicationControllerSpec{
						Template: &api.PodTemplateSpec{},
					},
				}},
			},
			api.PodList{},
			apps.StatefulSetList{},
			[]replicationcontroller.ReplicationController{{
				ObjectMeta: common.ObjectMeta{
					Name: "rc-name",
				},
				TypeMeta: common.TypeMeta{Kind: common.ResourceKindReplicationController},
				Pods: common.PodInfo{
					Warnings: []common.Event{},
				},
			}},
			[]replicaset.ReplicaSet{{
				ObjectMeta: common.ObjectMeta{
					Name: "rs-name",
				},
				TypeMeta: common.TypeMeta{Kind: common.ResourceKindReplicaSet},
				Pods: common.PodInfo{
					Warnings: []common.Event{},
				},
			}},
			[]joblist.Job{{
				ObjectMeta: common.ObjectMeta{
					Name: "job-name",
				},
				TypeMeta: common.TypeMeta{Kind: common.ResourceKindJob},
				Pods: common.PodInfo{
					Warnings: []common.Event{},
				},
			}},
			[]daemonsetlist.DaemonSet{{
				ObjectMeta: common.ObjectMeta{
					Name: "ds-name",
				},
				TypeMeta: common.TypeMeta{Kind: common.ResourceKindDaemonSet},
				Pods: common.PodInfo{
					Warnings: []common.Event{},
				},
			}},
			[]deployment.Deployment{{
				ObjectMeta: common.ObjectMeta{
					Name: "deployment-name",
				},
				TypeMeta: common.TypeMeta{Kind: common.ResourceKindDeployment},
				Pods: common.PodInfo{
					Warnings: []common.Event{},
				},
			}},
			[]pod.Pod{},
			[]statefulsetlist.StatefulSet{},
		},
	}

	for _, c := range cases {
		expected := &Workloads{
			ReplicationControllerList: replicationcontrollerlist.ReplicationControllerList{
				ListMeta:               common.ListMeta{TotalItems: len(c.rcs)},
				CumulativeMetrics:      make([]metric.Metric, 0),
				ReplicationControllers: c.rcs,
			},
			ReplicaSetList: replicasetlist.ReplicaSetList{
				ListMeta:          common.ListMeta{TotalItems: len(c.rs)},
				CumulativeMetrics: make([]metric.Metric, 0),
				ReplicaSets:       c.rs,
			},
			JobList: joblist.JobList{
				ListMeta:          common.ListMeta{TotalItems: len(c.jobs)},
				CumulativeMetrics: make([]metric.Metric, 0),
				Jobs:              c.jobs,
			},
			DaemonSetList: daemonsetlist.DaemonSetList{
				ListMeta:          common.ListMeta{TotalItems: len(c.daemonset)},
				CumulativeMetrics: make([]metric.Metric, 0),
				DaemonSets:        c.daemonset,
			},
			DeploymentList: deployment.DeploymentList{
				ListMeta:          common.ListMeta{TotalItems: len(c.deployment)},
				CumulativeMetrics: make([]metric.Metric, 0),
				Deployments:       c.deployment,
			},
			PodList: pod.PodList{
				ListMeta:          common.ListMeta{TotalItems: len(c.pod)},
				CumulativeMetrics: make([]metric.Metric, 0),
				Pods:              c.pod,
			},
			StatefulSetList: statefulsetlist.StatefulSetList{
				ListMeta:          common.ListMeta{TotalItems: len(c.statefulSet)},
				CumulativeMetrics: make([]metric.Metric, 0),
				StatefulSets:      c.statefulSet,
			},
		}
		var expectedErr error

		channels := &common.ResourceChannels{
			ReplicaSetList: common.ReplicaSetListChannel{
				List:  make(chan *extensions.ReplicaSetList, 1),
				Error: make(chan error, 1),
			},
			JobList: common.JobListChannel{
				List:  make(chan *batch.JobList, 1),
				Error: make(chan error, 1),
			},
			ReplicationControllerList: common.ReplicationControllerListChannel{
				List:  make(chan *api.ReplicationControllerList, 1),
				Error: make(chan error, 1),
			},
			DaemonSetList: common.DaemonSetListChannel{
				List:  make(chan *extensions.DaemonSetList, 1),
				Error: make(chan error, 1),
			},
			DeploymentList: common.DeploymentListChannel{
				List:  make(chan *extensions.DeploymentList, 1),
				Error: make(chan error, 1),
			},
			StatefulSetList: common.StatefulSetListChannel{
				List:  make(chan *apps.StatefulSetList, 1),
				Error: make(chan error, 1),
			},
			NodeList: common.NodeListChannel{
				List:  make(chan *api.NodeList, 6),
				Error: make(chan error, 6),
			},
			ServiceList: common.ServiceListChannel{
				List:  make(chan *api.ServiceList, 6),
				Error: make(chan error, 6),
			},
			PodList: common.PodListChannel{
				List:  make(chan *api.PodList, 7),
				Error: make(chan error, 7),
			},
			EventList: common.EventListChannel{
				List:  make(chan *api.EventList, 7),
				Error: make(chan error, 7),
			},
		}

		channels.ReplicaSetList.Error <- nil
		channels.ReplicaSetList.List <- &c.k8sRs

		channels.JobList.Error <- nil
		channels.JobList.List <- &c.k8sJobs

		channels.DaemonSetList.Error <- nil
		channels.DaemonSetList.List <- &c.k8sDaemonSet

		channels.DeploymentList.Error <- nil
		channels.DeploymentList.List <- &c.k8sDeployment

		channels.ReplicationControllerList.List <- &c.k8sRc
		channels.ReplicationControllerList.Error <- nil

		channels.StatefulSetList.List <- &c.k8sStatefulSet
		channels.StatefulSetList.Error <- nil

		nodeList := &api.NodeList{}
		channels.NodeList.List <- nodeList
		channels.NodeList.Error <- nil
		channels.NodeList.List <- nodeList
		channels.NodeList.Error <- nil
		channels.NodeList.List <- nodeList
		channels.NodeList.Error <- nil
		channels.NodeList.List <- nodeList
		channels.NodeList.Error <- nil
		channels.NodeList.List <- nodeList
		channels.NodeList.Error <- nil
		channels.NodeList.List <- nodeList
		channels.NodeList.Error <- nil

		serviceList := &api.ServiceList{}
		channels.ServiceList.List <- serviceList
		channels.ServiceList.Error <- nil
		channels.ServiceList.List <- serviceList
		channels.ServiceList.Error <- nil
		channels.ServiceList.List <- serviceList
		channels.ServiceList.Error <- nil
		channels.ServiceList.List <- serviceList
		channels.ServiceList.Error <- nil
		channels.ServiceList.List <- serviceList
		channels.ServiceList.Error <- nil
		channels.ServiceList.List <- serviceList
		channels.ServiceList.Error <- nil

		podList := &c.k8sPod
		channels.PodList.List <- podList
		channels.PodList.Error <- nil
		channels.PodList.List <- podList
		channels.PodList.Error <- nil
		channels.PodList.List <- podList
		channels.PodList.Error <- nil
		channels.PodList.List <- podList
		channels.PodList.Error <- nil
		channels.PodList.List <- podList
		channels.PodList.Error <- nil
		channels.PodList.List <- podList
		channels.PodList.Error <- nil
		channels.PodList.List <- podList
		channels.PodList.Error <- nil

		eventList := &api.EventList{}
		channels.EventList.List <- eventList
		channels.EventList.Error <- nil
		channels.EventList.List <- eventList
		channels.EventList.Error <- nil
		channels.EventList.List <- eventList
		channels.EventList.Error <- nil
		channels.EventList.List <- eventList
		channels.EventList.Error <- nil
		channels.EventList.List <- eventList
		channels.EventList.Error <- nil
		channels.EventList.List <- eventList
		channels.EventList.Error <- nil
		channels.EventList.List <- eventList
		channels.EventList.Error <- nil

		actual, err := GetWorkloadsFromChannels(channels, nil, dataselect.NoMetrics)
		if !reflect.DeepEqual(actual, expected) {
			t.Errorf("GetWorkloadsFromChannels() ==\n          %#v\nExpected: %#v", actual, expected)
		}
		if !reflect.DeepEqual(err, expectedErr) {
			t.Errorf("error from GetWorkloadsFromChannels() == %#v, expected %#v", err, expectedErr)
		}
	}
}
