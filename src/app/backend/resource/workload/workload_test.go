// Copyright 2017 The Kubernetes Dashboard Authors.
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

	"github.com/kubernetes/dashboard/src/app/backend/api"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/daemonset"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/deployment"
	"github.com/kubernetes/dashboard/src/app/backend/resource/job"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicaset"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicationcontroller"
	"github.com/kubernetes/dashboard/src/app/backend/resource/statefulset"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/pkg/api/v1"
	apps "k8s.io/client-go/pkg/apis/apps/v1beta1"
	batch "k8s.io/client-go/pkg/apis/batch/v1"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
)

func TestGetWorkloadsFromChannels(t *testing.T) {
	replicas := int32(0)
	var jobCompletions int32
	cases := []struct {
		k8sRs          extensions.ReplicaSetList
		k8sJobs        batch.JobList
		k8sDaemonSet   extensions.DaemonSetList
		k8sDeployment  extensions.DeploymentList
		k8sRc          v1.ReplicationControllerList
		k8sPod         v1.PodList
		k8sStatefulSet apps.StatefulSetList
		rcs            []replicationcontroller.ReplicationController
		rs             []replicaset.ReplicaSet
		jobs           []job.Job
		daemonset      []daemonset.DaemonSet
		deployment     []deployment.Deployment
		pod            []pod.Pod
		statefulSet    []statefulset.StatefulSet
	}{
		{
			extensions.ReplicaSetList{},
			batch.JobList{},
			extensions.DaemonSetList{},
			extensions.DeploymentList{},
			v1.ReplicationControllerList{},
			v1.PodList{},
			apps.StatefulSetList{},
			[]replicationcontroller.ReplicationController{},
			[]replicaset.ReplicaSet{},
			[]job.Job{},
			[]daemonset.DaemonSet{},
			[]deployment.Deployment{},
			[]pod.Pod{},
			[]statefulset.StatefulSet{},
		},
		{
			extensions.ReplicaSetList{
				Items: []extensions.ReplicaSet{
					{
						ObjectMeta: metaV1.ObjectMeta{Name: "rs-name"},
						Spec: extensions.ReplicaSetSpec{
							Replicas: &replicas,
							Selector: &metaV1.LabelSelector{},
						},
					}},
			},
			batch.JobList{
				Items: []batch.Job{
					{
						ObjectMeta: metaV1.ObjectMeta{Name: "job-name"},
						Spec: batch.JobSpec{
							Selector:    &metaV1.LabelSelector{},
							Completions: &jobCompletions,
						},
					}},
			},
			extensions.DaemonSetList{
				Items: []extensions.DaemonSet{
					{
						ObjectMeta: metaV1.ObjectMeta{Name: "ds-name"},
						Spec:       extensions.DaemonSetSpec{Selector: &metaV1.LabelSelector{}},
					}},
			},
			extensions.DeploymentList{
				Items: []extensions.Deployment{
					{
						ObjectMeta: metaV1.ObjectMeta{Name: "deployment-name"},
						Spec: extensions.DeploymentSpec{
							Selector: &metaV1.LabelSelector{},
							Replicas: &replicas,
						},
					}},
			},
			v1.ReplicationControllerList{
				Items: []v1.ReplicationController{{
					ObjectMeta: metaV1.ObjectMeta{Name: "rc-name"},
					Spec: v1.ReplicationControllerSpec{
						Replicas: &replicas,
						Template: &v1.PodTemplateSpec{},
					},
				}},
			},
			v1.PodList{},
			apps.StatefulSetList{},
			[]replicationcontroller.ReplicationController{{
				ObjectMeta: api.ObjectMeta{
					Name: "rc-name",
				},
				TypeMeta: api.TypeMeta{Kind: api.ResourceKindReplicationController},
				Pods: common.PodInfo{
					Warnings: []common.Event{},
				},
			}},
			[]replicaset.ReplicaSet{{
				ObjectMeta: api.ObjectMeta{
					Name: "rs-name",
				},
				TypeMeta: api.TypeMeta{Kind: api.ResourceKindReplicaSet},
				Pods: common.PodInfo{
					Warnings: []common.Event{},
				},
			}},
			[]job.Job{{
				ObjectMeta: api.ObjectMeta{
					Name: "job-name",
				},
				TypeMeta: api.TypeMeta{Kind: api.ResourceKindJob},
				Pods: common.PodInfo{
					Warnings: []common.Event{},
				},
			}},
			[]daemonset.DaemonSet{{
				ObjectMeta: api.ObjectMeta{
					Name: "ds-name",
				},
				TypeMeta: api.TypeMeta{Kind: api.ResourceKindDaemonSet},
				Pods: common.PodInfo{
					Warnings: []common.Event{},
				},
			}},
			[]deployment.Deployment{{
				ObjectMeta: api.ObjectMeta{
					Name: "deployment-name",
				},
				TypeMeta: api.TypeMeta{Kind: api.ResourceKindDeployment},
				Pods: common.PodInfo{
					Warnings: []common.Event{},
				},
			}},
			[]pod.Pod{},
			[]statefulset.StatefulSet{},
		},
	}

	for _, c := range cases {
		expected := &Workloads{
			ReplicationControllerList: replicationcontroller.ReplicationControllerList{
				ListMeta:               api.ListMeta{TotalItems: len(c.rcs)},
				CumulativeMetrics:      make([]metricapi.Metric, 0),
				ReplicationControllers: c.rcs,
			},
			ReplicaSetList: replicaset.ReplicaSetList{
				ListMeta:          api.ListMeta{TotalItems: len(c.rs)},
				CumulativeMetrics: make([]metricapi.Metric, 0),
				ReplicaSets:       c.rs,
			},
			JobList: job.JobList{
				ListMeta:          api.ListMeta{TotalItems: len(c.jobs)},
				CumulativeMetrics: make([]metricapi.Metric, 0),
				Jobs:              c.jobs,
			},
			DaemonSetList: daemonset.DaemonSetList{
				ListMeta:          api.ListMeta{TotalItems: len(c.daemonset)},
				CumulativeMetrics: make([]metricapi.Metric, 0),
				DaemonSets:        c.daemonset,
			},
			DeploymentList: deployment.DeploymentList{
				ListMeta:          api.ListMeta{TotalItems: len(c.deployment)},
				CumulativeMetrics: make([]metricapi.Metric, 0),
				Deployments:       c.deployment,
			},
			PodList: pod.PodList{
				ListMeta:          api.ListMeta{TotalItems: len(c.pod)},
				CumulativeMetrics: []metricapi.Metric{},
				Pods:              c.pod,
			},
			StatefulSetList: statefulset.StatefulSetList{
				ListMeta:          api.ListMeta{TotalItems: len(c.statefulSet)},
				CumulativeMetrics: make([]metricapi.Metric, 0),
				StatefulSets:      c.statefulSet,
			},
		}
		var expectedErr error

		channels := &common.ResourceChannels{
			ReplicaSetList: common.ReplicaSetListChannel{
				List:  make(chan *extensions.ReplicaSetList, 2),
				Error: make(chan error, 2),
			},
			JobList: common.JobListChannel{
				List:  make(chan *batch.JobList, 1),
				Error: make(chan error, 1),
			},
			ReplicationControllerList: common.ReplicationControllerListChannel{
				List:  make(chan *v1.ReplicationControllerList, 1),
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
				List:  make(chan *v1.NodeList, 6),
				Error: make(chan error, 6),
			},
			ServiceList: common.ServiceListChannel{
				List:  make(chan *v1.ServiceList, 6),
				Error: make(chan error, 6),
			},
			PodList: common.PodListChannel{
				List:  make(chan *v1.PodList, 7),
				Error: make(chan error, 7),
			},
			EventList: common.EventListChannel{
				List:  make(chan *v1.EventList, 7),
				Error: make(chan error, 7),
			},
		}

		channels.ReplicaSetList.Error <- nil
		channels.ReplicaSetList.List <- &c.k8sRs
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

		nodeList := &v1.NodeList{}
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

		serviceList := &v1.ServiceList{}
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

		eventList := &v1.EventList{}
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

		actual, err := GetWorkloadsFromChannels(channels, nil, dataselect.DefaultDataSelect)
		if !reflect.DeepEqual(actual, expected) {
			t.Errorf("GetWorkloadsFromChannels() ==\n          %#v\nExpected: %#v", actual, expected)
		}
		if !reflect.DeepEqual(err, expectedErr) {
			t.Errorf("error from GetWorkloadsFromChannels() == %#v, expected %#v", err, expectedErr)
		}
	}
}
