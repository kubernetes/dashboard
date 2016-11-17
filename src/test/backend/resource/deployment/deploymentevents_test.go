package deployment

import (
	"testing"
)

func TestGetDeploymentEvents(t *testing.T) {
	// TODO: fix test
	t.Skip("NewSimpleFake no longer supported. Test update needed.")

	//cases := []struct {
	//	namespace, name string
	//	eventList       *api.EventList
	//	deployment      *extensions.Deployment
	//	expectedActions []string
	//	expected        *common.EventList
	//}{
	//	{
	//		"test-namespace", "test-name",
	//		&api.EventList{Items: []api.Event{
	//			{Message: "test-message", ObjectMeta: api.ObjectMeta{Namespace: "test-namespace"}},
	//		}},
	//		&extensions.Deployment{
	//			ObjectMeta: api.ObjectMeta{Name: "test-replicaset"},
	//			Spec: extensions.DeploymentSpec{
	//				Selector: &unversioned.LabelSelector{
	//					MatchLabels: map[string]string{},
	//				}}},
	//		[]string{"list"},
	//		&common.EventList{
	//			ListMeta: common.ListMeta{TotalItems: 1},
	//			Events: []common.Event{{
	//				TypeMeta:   common.TypeMeta{Kind: common.ResourceKindEvent},
	//				ObjectMeta: common.ObjectMeta{Namespace: "test-namespace"},
	//				Message:    "test-message",
	//				Type:       api.EventTypeNormal,
	//			}}},
	//	},
	//}
	//
	//for _, c := range cases {
	//
	//	fakeClient := testclient.NewSimpleFake(c.eventList, c.deployment,
	//		&api.EventList{})
	//
	//	actual, _ := GetDeploymentEvents(fakeClient, dataselect.NoDataSelect, c.namespace, c.name)
	//
	//	if !reflect.DeepEqual(actual, c.expected) {
	//		t.Errorf("GetDeploymentEvents(client,%#v, %#v) == \ngot: %#v, \nexpected %#v",
	//			c.namespace, c.name, actual, c.expected)
	//	}
	//}
}
