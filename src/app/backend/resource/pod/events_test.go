package pod

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
	api "k8s.io/client-go/pkg/api/v1"
)

func TestGetPodEvents(t *testing.T) {
	cases := []struct {
		namespace, name string
		eventList       *api.EventList
		expected        *common.EventList
	}{
		{
			"ns-1", "dp-1",
			&api.EventList{Items: []api.Event{
				{Message: "test-message", ObjectMeta: metaV1.ObjectMeta{
					Name: "ev-1", Namespace: "ns-1", Labels: map[string]string{"app": "test"},
				}},
			}},
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
		fakeClient := fake.NewSimpleClientset(c.eventList)

		actual, _ := GetEventsForPod(fakeClient, dataselect.NoDataSelect, c.namespace, c.name)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetEventsForPods(%#v) == \ngot %#v, \nexpected %#v", actual,
				c.expected)
		}
	}
}
