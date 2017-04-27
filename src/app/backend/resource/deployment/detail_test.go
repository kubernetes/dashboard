package deployment

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/horizontalpodautoscaler"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicaset"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
	"k8s.io/client-go/kubernetes/fake"
	api "k8s.io/client-go/pkg/api/v1"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
)

func createDeployment(name, namespace, podTemplateName string, podLabel,
	labelSelector map[string]string) *extensions.Deployment {
	replicas := int32(4)
	maxSurge := intstr.FromInt(1)
	maxUnavailable := intstr.FromString("25%")

	return &extensions.Deployment{
		ObjectMeta: metaV1.ObjectMeta{
			Name: name, Namespace: namespace, Labels: labelSelector,
		},
		Spec: extensions.DeploymentSpec{
			Selector: &metaV1.LabelSelector{MatchLabels: labelSelector},
			Replicas: &replicas, MinReadySeconds: 5,
			Strategy: extensions.DeploymentStrategy{
				Type: extensions.RollingUpdateDeploymentStrategyType,
				RollingUpdate: &extensions.RollingUpdateDeployment{
					MaxSurge:       &maxSurge,
					MaxUnavailable: &maxUnavailable,
				},
			},
			Template: api.PodTemplateSpec{
				ObjectMeta: metaV1.ObjectMeta{Name: podTemplateName, Labels: podLabel}},
		},
		Status: extensions.DeploymentStatus{
			Replicas: 4, UpdatedReplicas: 2, AvailableReplicas: 3, UnavailableReplicas: 1,
		},
	}
}

func createReplicaSet(name, namespace string, labelSelector map[string]string,
	podTemplateSpec api.PodTemplateSpec) extensions.ReplicaSet {
	replicas := int32(0)
	return extensions.ReplicaSet{
		ObjectMeta: metaV1.ObjectMeta{
			Name: name, Namespace: namespace, Labels: labelSelector,
		},
		Spec: extensions.ReplicaSetSpec{
			Replicas: &replicas,
			Template: podTemplateSpec,
		},
	}
}

func TestGetDeploymentDetail(t *testing.T) {
	podList := &api.PodList{}
	eventList := &api.EventList{}

	deployment := createDeployment("dp-1", "ns-1", "pod-1", map[string]string{"track": "beta"},
		map[string]string{"foo": "bar"})

	podTemplateSpec := GetNewReplicaSetTemplate(deployment)

	newReplicaSet := createReplicaSet("rs-1", "ns-1", map[string]string{"foo": "bar"},
		podTemplateSpec)

	replicaSetList := &extensions.ReplicaSetList{
		Items: []extensions.ReplicaSet{
			newReplicaSet,
			createReplicaSet("rs-2", "ns-1", map[string]string{"foo": "bar"},
				podTemplateSpec),
		},
	}

	maxSurge := intstr.FromInt(1)
	maxUnavailable := intstr.FromString("25%")

	cases := []struct {
		namespace, name string
		expectedActions []string
		deployment      *extensions.Deployment
		expected        *DeploymentDetail
	}{
		{
			"ns-1", "dp-1",
			[]string{"get", "list", "list", "get", "list", "list", "get", "list", "list", "get", "list", "list", "list"},
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
					MaxSurge:       &maxSurge,
					MaxUnavailable: &maxUnavailable,
				},
				OldReplicaSetList: replicaset.ReplicaSetList{
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
				HorizontalPodAutoscalerList: horizontalpodautoscaler.HorizontalPodAutoscalerList{HorizontalPodAutoscalers: []horizontalpodautoscaler.HorizontalPodAutoscaler{}},
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
