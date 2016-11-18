package deployment

import (
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/apis/extensions"
	"k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset/fake"

	"reflect"
	"testing"
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
			"ns-1", "dp-1",
			&api.EventList{Items: []api.Event{
				{Message: "test-message", ObjectMeta: api.ObjectMeta{
					Name: "ev-1", Namespace: "ns-1", Labels: map[string]string{"app": "test"},
				}},
			}},
			createDeployment("dp-1", "ns-1", "pod-1", map[string]string{"app": "test"},
				map[string]string{"app": "test"}),
			[]string{"list"},
			&common.EventList{
				ListMeta: common.ListMeta{TotalItems: 1},
				Events: []common.Event{{
					TypeMeta: common.TypeMeta{Kind: common.ResourceKindEvent},
					ObjectMeta: common.ObjectMeta{Name: "ev-1", Namespace: "ns-1",
						Labels: map[string]string{"app": "test"}},
					Message: "test-message",
					Type:    api.EventTypeNormal,
				}}},
		},
	}

	for _, c := range cases {

		fakeClient := fake.NewSimpleClientset(c.eventList, c.deployment)

		actual, _ := GetDeploymentEvents(fakeClient, dataselect.NoDataSelect, c.namespace, c.name)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetDeploymentEvents(client,%#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.namespace, c.name, actual, c.expected)
		}
	}
}
