package controller

import (
	"reflect"
	"testing"

	meta "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/pkg/api/v1"
)

type Person struct {
	name string
}

func TestGetPodNames(t *testing.T) {
	cases := []struct {
		pods          []v1.Pod
		expectedNames []string
	}{
		{
			pods:          nil,
			expectedNames: []string{},
		},
		{
			pods:          []v1.Pod{newPod("a"), newPod("b")},
			expectedNames: []string{"a", "b"},
		},
	}

	for _, c := range cases {
		actual := getPodNames(c.pods)
		if !reflect.DeepEqual(actual, c.expectedNames) {
			t.Errorf("GetPodNames(%+v) == %+v, expected %+v",
				c.pods, actual, c.expectedNames)
		}
	}

}

func newPod(name string) v1.Pod {
	return v1.Pod{ObjectMeta: meta.ObjectMeta{Name: name}}
}
