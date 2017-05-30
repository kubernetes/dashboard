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
		namespace, podName string
		eventList          *api.EventList
		podList            *api.PodList
		expected           *common.EventList
	}{
		{
			"ns-1", "pod-1",
			&api.EventList{Items: []api.Event{
				{
					Message: "test-message",
					ObjectMeta: metaV1.ObjectMeta{
						Name: "ev-1", Namespace: "ns-1",
						Labels: map[string]string{"app": "test"},
					},
					InvolvedObject: api.ObjectReference{UID: "test-uid"}},
			}},
			&api.PodList{Items: []api.Pod{
				{ObjectMeta: metaV1.ObjectMeta{
					Name:      "pod-1",
					Namespace: "ns-1",
					UID:       "test-uid",
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
		fakeClient := fake.NewSimpleClientset(c.podList, c.eventList)

		actual, _ := GetEventsForPod(fakeClient, dataselect.NoDataSelect, c.namespace, c.podName)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetEventsForPods == \ngot %#v, \nexpected %#v", actual,
				c.expected)
		}
	}
}
