// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http:Service//www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package pod

import (
	"fmt"
	"net/http"
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset/fake"
	"k8s.io/kubernetes/pkg/client/restclient"
)

type FakeHeapsterClient struct{}

type clientFunc func(req *http.Request) (*http.Response, error)

func (f clientFunc) Do(req *http.Request) (*http.Response, error) {
	return f(req)
}

func (c FakeHeapsterClient) Get(path string) client.RequestInterface {
	return restclient.NewRequest(clientFunc(func(req *http.Request) (*http.Response, error) {
		return nil, fmt.Errorf("fake error")
	}), "GET", nil, "/api/v1", restclient.ContentConfig{}, restclient.Serializers{}, nil, nil)
}

func TestToPodDetail(t *testing.T) {
	cases := []struct {
		pod      *api.PodList
		expected *PodDetail
	}{
		{
			pod: &api.PodList{Items: []api.Pod{{
				ObjectMeta: api.ObjectMeta{
					Name: "test-pod", Namespace: "test-namespace",
					Labels: map[string]string{"app": "test"},
				}}}},
			expected: &PodDetail{
				TypeMeta: common.TypeMeta{Kind: common.ResourceKindPod},
				ObjectMeta: common.ObjectMeta{
					Name:      "test-pod",
					Namespace: "test-namespace",
					Labels:    map[string]string{"app": "test"},
				},
				Controller: Controller{Kind: "unknown"},
				Containers: []Container{},
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.pod)

		dataselect.DefaultDataSelectWithMetrics.MetricQuery = dataselect.NoMetrics
		actual, err := GetPodDetail(fakeClient, FakeHeapsterClient{}, "test-namespace", "test-pod")

		if err != nil {
			t.Errorf("GetPodDetail(%#v) == \ngot err %#v", c.pod, err)
		}
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetPodDetail(%#v) == \ngot %#v, \nexpected %#v", c.pod, actual,
				c.expected)
		}
	}
}
