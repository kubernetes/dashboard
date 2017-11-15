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

package deployment

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/horizontalpodautoscaler"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicaset"
	apps "k8s.io/api/apps/v1beta2"
	"k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
	"k8s.io/client-go/kubernetes/fake"
)

func createDeployment(name, namespace, podTemplateName string, replicas int32, podLabel,
	labelSelector map[string]string) *apps.Deployment {
	maxSurge := intstr.FromInt(1)
	maxUnavailable := intstr.FromString("25%")

	return &apps.Deployment{
		ObjectMeta: metaV1.ObjectMeta{
			Name: name, Namespace: namespace, Labels: labelSelector,
		},
		Spec: apps.DeploymentSpec{
			Selector:        &metaV1.LabelSelector{MatchLabels: labelSelector},
			Replicas:        &replicas,
			MinReadySeconds: 5,
			Strategy: apps.DeploymentStrategy{
				Type: apps.RollingUpdateDeploymentStrategyType,
				RollingUpdate: &apps.RollingUpdateDeployment{
					MaxSurge:       &maxSurge,
					MaxUnavailable: &maxUnavailable,
				},
			},
			Template: v1.PodTemplateSpec{
				ObjectMeta: metaV1.ObjectMeta{Name: podTemplateName, Labels: podLabel}},
		},
		Status: apps.DeploymentStatus{
			Replicas: replicas, UpdatedReplicas: 2, AvailableReplicas: 3, UnavailableReplicas: 1,
		},
	}
}

func createReplicaSet(name, namespace string, replicas int32, labelSelector map[string]string,
	podTemplateSpec v1.PodTemplateSpec) apps.ReplicaSet {
	return apps.ReplicaSet{
		ObjectMeta: metaV1.ObjectMeta{
			Name: name, Namespace: namespace, Labels: labelSelector,
		},
		Spec: apps.ReplicaSetSpec{
			Replicas: &replicas,
			Template: podTemplateSpec,
		},
	}
}

func TestGetDeploymentDetail(t *testing.T) {
	podList := &v1.PodList{}
	eventList := &v1.EventList{}
	var replicas int32 = 4

	deployment := createDeployment("dp-1", "ns-1", "pod-1", replicas,
		map[string]string{"track": "beta"}, map[string]string{"foo": "bar"})

	podTemplateSpec := GetNewReplicaSetTemplate(deployment)

	newReplicaSet := createReplicaSet("rs-1", "ns-1", replicas, map[string]string{"foo": "bar"},
		podTemplateSpec)

	replicaSetList := &apps.ReplicaSetList{
		Items: []apps.ReplicaSet{
			newReplicaSet,
			createReplicaSet("rs-2", "ns-1", replicas, map[string]string{"foo": "bar"},
				podTemplateSpec),
		},
	}

	maxSurge := intstr.FromInt(1)
	maxUnavailable := intstr.FromString("25%")

	cases := []struct {
		namespace, name string
		expectedActions []string
		deployment      *apps.Deployment
		expected        *DeploymentDetail
	}{
		{
			"ns-1", "dp-1",
			[]string{"get", "list", "list", "get", "list", "list", "list", "list", "list", "get", "list", "list", "list", "list"},
			deployment,
			&DeploymentDetail{
				ObjectMeta: api.ObjectMeta{
					Name:      "dp-1",
					Namespace: "ns-1",
					Labels:    map[string]string{"foo": "bar"},
				},
				TypeMeta: api.TypeMeta{Kind: api.ResourceKindDeployment},
				PodList: pod.PodList{
					Pods:              []pod.Pod{},
					CumulativeMetrics: make([]metricapi.Metric, 0),
					Errors:            []error{},
				},
				Selector: map[string]string{"foo": "bar"},
				StatusInfo: StatusInfo{
					Replicas:    4,
					Updated:     2,
					Available:   3,
					Unavailable: 1,
				},
				Strategy:        "RollingUpdate",
				MinReadySeconds: 5,
				RollingUpdateStrategy: &RollingUpdateStrategy{
					MaxSurge:       &maxSurge,
					MaxUnavailable: &maxUnavailable,
				},
				OldReplicaSetList: replicaset.ReplicaSetList{
					ReplicaSets:       []replicaset.ReplicaSet{},
					CumulativeMetrics: make([]metricapi.Metric, 0),
					Errors:            []error{},
				},
				NewReplicaSet: replicaset.ReplicaSet{
					ObjectMeta: api.NewObjectMeta(newReplicaSet.ObjectMeta),
					TypeMeta:   api.NewTypeMeta(api.ResourceKindReplicaSet),
					Pods: common.PodInfo{
						Warnings: []common.Event{},
						Desired:  &replicas,
					},
				},
				EventList: common.EventList{
					Events: []common.Event{},
				},
				HorizontalPodAutoscalerList: horizontalpodautoscaler.HorizontalPodAutoscalerList{
					HorizontalPodAutoscalers: []horizontalpodautoscaler.HorizontalPodAutoscaler{},
					Errors: []error{},
				},
				Errors: []error{},
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.deployment, replicaSetList, podList, eventList)
		dataselect.DefaultDataSelectWithMetrics.MetricQuery = dataselect.NoMetrics
		actual, _ := GetDeploymentDetail(fakeClient, nil, c.namespace, c.name)

		actions := fakeClient.Actions()
		if len(actions) != len(c.expectedActions) {
			t.Errorf("Unexpected actions: %v, expected %d actions got %d", actions,
				len(c.expectedActions), len(actions))
			continue
		}

		for i, verb := range c.expectedActions {
			if actions[i].GetVerb() != verb {
				t.Errorf("Unexpected action: %+v, expected %s", actions[i], verb)
			}
		}

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetDeploymentDetail(client, namespace, name) == \ngot: %#v, \nexpected %#v",
				actual, c.expected)
		}
	}
}
