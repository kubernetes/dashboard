package deployment

import (
	"reflect"
	"testing"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	"k8s.io/kubernetes/pkg/apis/extensions"
	"k8s.io/kubernetes/pkg/client/unversioned/testclient"

	"github.com/kubernetes/dashboard/resource/common"
)

func TestGetDeploymentEvents(t *testing.T) {
	cases := []struct {
		namespace, name string
		eventList       *api.EventList
		deployment      *extensions.Deployment
		expectedActions []string
		expected        *common.EventList
	}{
		{
			"test-namespace", "test-name",
			&api.EventList{Items: []api.Event{
				{Message: "test-message", ObjectMeta: api.ObjectMeta{Namespace: "test-namespace"}},
			}},
			&extensions.Deployment{
				ObjectMeta: api.ObjectMeta{Name: "test-replicaset"},
				Spec: extensions.DeploymentSpec{
					Selector: &unversioned.LabelSelector{
						MatchLabels: map[string]string{},
					}}},
			[]string{"list"},
			&common.EventList{
				Namespace: "test-namespace",
				Events: []common.Event{{
					TypeMeta:   common.TypeMeta{Kind: common.ResourceKindEvent},
					ObjectMeta: common.ObjectMeta{Namespace: "test-namespace"},
					Message:    "test-message",
					Type:       api.EventTypeNormal,
				}}},
		},
	}

	for _, c := range cases {
		fakeClient := testclient.NewSimpleFake(c.eventList, c.deployment)

		actual, _ := GetDeploymentEvents(fakeClient, c.namespace, c.name)

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
			t.Errorf("GetDeploymentEvents(client,%#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.namespace, c.name, actual, c.expected)
		}
	}
}
