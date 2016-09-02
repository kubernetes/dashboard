package metric

import (
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	"reflect"
	"testing"
)

func TestResourceSelector(t *testing.T) {
	resource1 := map[string]string{
		"resource": "1",
	}
	resource2 := map[string]string{
		"resource": "2",
	}
	var cachedPodList = []api.Pod{
		{
			ObjectMeta: api.ObjectMeta{
				Name:      "1",
				Labels:    resource1,
				Namespace: "a",
			},
		},
		{
			ObjectMeta: api.ObjectMeta{
				Name:      "2",
				Labels:    resource2,
				Namespace: "a",
			},
		},
		{
			ObjectMeta: api.ObjectMeta{
				Name:      "3",
				Labels:    resource1,
				Namespace: "a",
			},
		},
		{
			ObjectMeta: api.ObjectMeta{
				Name:      "4",
				Labels:    resource1,
				Namespace: "b",
			},
		},
		{
			ObjectMeta: api.ObjectMeta{
				Name:   "5",
				Labels: resource1,
			},
		},
	}
	testCases := []struct {
		Info                   string
		ResourceSelector       ResourceSelector
		ExpectedPath           string
		ExpectedTargetResource common.ResourceKind
		ExpectedResources      []string
	}{
		{
			"ResourceSelector for native resource - pod",
			ResourceSelector{
				Namespace:    "bar",
				ResourceType: common.ResourceKindPod,
				ResourceName: "foo",
			},
			`namespaces/bar/pod-list/`,
			common.ResourceKindPod,
			[]string{"foo"},
		},
		{
			"ResourceSelector for native resource - node",
			ResourceSelector{
				Namespace:    "barn",
				ResourceType: common.ResourceKindNode,
				ResourceName: "foon",
			},
			`nodes/`,
			common.ResourceKindNode,
			[]string{"foon"},
		},
		{
			"ResourceSelector for derived resource with old style selector",
			ResourceSelector{
				Namespace:    "a",
				ResourceType: common.ResourceKindDeployment,
				ResourceName: "baba",
				Selector:     resource1,
			},
			`namespaces/a/pod-list/`,
			common.ResourceKindPod,
			[]string{"1", "3"},
		},
		{
			"ResourceSelector for derived resource with new style selector",
			ResourceSelector{
				Namespace:     "a",
				ResourceType:  common.ResourceKindDeployment,
				ResourceName:  "baba",
				LabelSelector: &unversioned.LabelSelector{MatchLabels: resource1},
			},
			`namespaces/a/pod-list/`,
			common.ResourceKindPod,
			[]string{"1", "3"},
		},
	}
	for _, testCase := range testCases {
		sel, err := testCase.ResourceSelector.GetHeapsterSelector(cachedPodList)
		if err != nil {
			t.Errorf("Test Case: %s. Failed to get HeapsterSelector. - %s", testCase.Info, err)
			return
		}
		if !reflect.DeepEqual(sel.Resources, testCase.ExpectedResources) {
			t.Errorf("Test Case: %s. Converted resource selector to incorrect native resources. Got %v, expected %v.",
				testCase.Info, sel.Resources, testCase.ExpectedResources)
		}
		if sel.TargetResourceType != testCase.ExpectedTargetResource {
			t.Errorf("Test Case: %s. Used invalid target resource type. Got %s, expected %s.",
				testCase.Info, sel.TargetResourceType, testCase.ExpectedTargetResource)
		}
		if sel.Path != testCase.ExpectedPath {
			t.Errorf("Test Case: %s. Converted to invalid heapster download path. Got %s, expected %s.",
				testCase.Info, sel.Path, testCase.ExpectedPath)
		}

	}
}
