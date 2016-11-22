package deployment

import (
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/horizontalpodautoscaler/horizontalpodautoscalerlist"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicaset"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicaset/replicasetlist"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	"k8s.io/kubernetes/pkg/apis/extensions"
	"k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset/fake"
	"k8s.io/kubernetes/pkg/controller/deployment/util"
	"k8s.io/kubernetes/pkg/util/intstr"

	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	"reflect"
	"testing"
)

func createDeployment(name, namespace, podTemplateName string, podLabel,
	labelSelector map[string]string) *extensions.Deployment {
	return &extensions.Deployment{
		ObjectMeta: api.ObjectMeta{
			Name: name, Namespace: namespace, Labels: labelSelector,
		},
		Spec: extensions.DeploymentSpec{
			Selector: &unversioned.LabelSelector{MatchLabels: labelSelector},
			Replicas: 4, MinReadySeconds: 5,
			Strategy: extensions.DeploymentStrategy{
				Type: extensions.RollingUpdateDeploymentStrategyType,
				RollingUpdate: &extensions.RollingUpdateDeployment{
					MaxSurge:       intstr.FromInt(1),
					MaxUnavailable: intstr.FromString("1"),
				},
			},
			Template: api.PodTemplateSpec{
				ObjectMeta: api.ObjectMeta{Name: podTemplateName, Labels: podLabel}},
		},
		Status: extensions.DeploymentStatus{
			Replicas: 4, UpdatedReplicas: 2, AvailableReplicas: 3, UnavailableReplicas: 1,
		},
	}
}

func createReplicaSet(name, namespace string, labelSelector map[string]string,
	podTemplateSpec api.PodTemplateSpec) extensions.ReplicaSet {
	return extensions.ReplicaSet{
		ObjectMeta: api.ObjectMeta{
			Name: name, Namespace: namespace, Labels: labelSelector,
		},
		Spec: extensions.ReplicaSetSpec{Template: podTemplateSpec},
	}
}

func TestGetDeploymentDetail(t *testing.T) {
	podList := &api.PodList{}
	eventList := &api.EventList{}

	deployment := createDeployment("dp-1", "ns-1", "pod-1", map[string]string{"track": "beta"},
		map[string]string{"foo": "bar"})

	podTemplateSpec := util.GetNewReplicaSetTemplate(deployment)

	newReplicaSet := createReplicaSet("rs-1", "ns-1", map[string]string{"foo": "bar"},
		podTemplateSpec)

	replicaSetList := &extensions.ReplicaSetList{
		Items: []extensions.ReplicaSet{
			newReplicaSet,
			createReplicaSet("rs-2", "ns-1", map[string]string{"foo": "bar"},
				podTemplateSpec),
		},
	}

	cases := []struct {
		namespace, name string
		expectedActions []string
		deployment      *extensions.Deployment
		expected        *DeploymentDetail
	}{
		{
			"ns-1", "dp-1",
			[]string{"get", "list", "list", "get", "list", "get", "list", "list", "get", "list", "list", "list"},
			deployment,
			&DeploymentDetail{
				ObjectMeta: common.ObjectMeta{
					Name:      "dp-1",
					Namespace: "ns-1",
					Labels:    map[string]string{"foo": "bar"},
				},
				TypeMeta: common.TypeMeta{Kind: common.ResourceKindDeployment},
				PodList: pod.PodList{
					Pods:              []pod.Pod{},
					CumulativeMetrics: make([]metric.Metric, 0),
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
					MaxSurge:       1,
					MaxUnavailable: 1,
				},
				OldReplicaSetList: replicasetlist.ReplicaSetList{
					ReplicaSets:       []replicaset.ReplicaSet{},
					CumulativeMetrics: make([]metric.Metric, 0),
				},
				NewReplicaSet: replicaset.ReplicaSet{
					ObjectMeta: common.NewObjectMeta(newReplicaSet.ObjectMeta),
					TypeMeta:   common.NewTypeMeta(common.ResourceKindReplicaSet),
					Pods:       common.PodInfo{Warnings: []common.Event{}},
				},
				EventList: common.EventList{
					Events: []common.Event{},
				},
				HorizontalPodAutoscalerList: horizontalpodautoscalerlist.HorizontalPodAutoscalerList{HorizontalPodAutoscalers: []horizontalpodautoscalerlist.HorizontalPodAutoscaler{}},
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
				t.Errorf("Unexpected action: %+v, expected %s",
					actions[i], verb)
			}
		}

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetDeploymentDetail(client, namespace, name) == \ngot: %#v, \nexpected %#v",
				actual, c.expected)
		}
	}
}
