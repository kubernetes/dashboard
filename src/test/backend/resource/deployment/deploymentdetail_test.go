package deployment

import (
	"reflect"
	"testing"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	"k8s.io/kubernetes/pkg/apis/extensions"
	"k8s.io/kubernetes/pkg/client/unversioned/testclient"
	"k8s.io/kubernetes/pkg/util/intstr"

	"github.com/kubernetes/dashboard/resource/common"
)

func TestGetDeploymentDetailFromChannels(t *testing.T) {

	cases := []struct {
		namespace, name string
		expectedActions []string
		deployment      *extensions.Deployment
		expected        *DeploymentDetail
	}{
		{
			"test-namespace", "test-name",
			[]string{"get"},
			&extensions.Deployment{
				ObjectMeta: api.ObjectMeta{Name: "test-name"},
				Spec: extensions.DeploymentSpec{
					Selector:        &unversioned.LabelSelector{MatchLabels: map[string]string{"foo": "bar"}},
					Replicas:        4,
					MinReadySeconds: 5,
					Strategy: extensions.DeploymentStrategy{
						Type: extensions.RollingUpdateDeploymentStrategyType,
						RollingUpdate: &extensions.RollingUpdateDeployment{
							MaxSurge:       intstr.FromInt(1),
							MaxUnavailable: intstr.FromString("1"),
						},
					},
				},
				Status: extensions.DeploymentStatus{
					Replicas:            4,
					UpdatedReplicas:     2,
					AvailableReplicas:   3,
					UnavailableReplicas: 1,
				},
			},
			&DeploymentDetail{
				ObjectMeta: common.ObjectMeta{Name: "test-name"},
				TypeMeta:   common.TypeMeta{Kind: common.ResourceKindDeployment},
				Selector:   map[string]string{"foo": "bar"},
				Status: extensions.DeploymentStatus{
					Replicas:            4,
					UpdatedReplicas:     2,
					AvailableReplicas:   3,
					UnavailableReplicas: 1,
				},
				Strategy:        "RollingUpdate",
				MinReadySeconds: 5,
				RollingUpdateStrategy: RollingUpdateStrategy{
					MaxSurge:       1,
					MaxUnavailable: 1,
				},
			},
		},
	}

	for _, c := range cases {

		fakeClient := testclient.NewSimpleFake(c.deployment)

		actual, _ := GetDeploymentDetail(fakeClient, c.namespace, c.name)

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
				c.namespace, c.name, actual, c.expected)
		}
	}
}
