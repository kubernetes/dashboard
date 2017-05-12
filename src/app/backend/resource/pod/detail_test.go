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

	"encoding/base64"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/owner"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
	"k8s.io/client-go/pkg/api/v1"
	api "k8s.io/client-go/pkg/api/v1"
	restclient "k8s.io/client-go/rest"
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

func TestGetPodDetail(t *testing.T) {
	cases := []struct {
		pod      *api.PodList
		expected *PodDetail
	}{
		{
			pod: &api.PodList{Items: []api.Pod{{
				ObjectMeta: metaV1.ObjectMeta{
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
				Controller: owner.ResourceOwner{},
				Containers: []Container{},
				EventList:  common.EventList{Events: []common.Event{}},
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

func TestEvalValueFrom(t *testing.T) {
	cases := []struct {
		src        *v1.EnvVarSource
		container  *v1.Container
		pod        *v1.Pod
		configMaps *v1.ConfigMapList
		secrets    *v1.SecretList
		expected   string
	}{
		{
			src: &v1.EnvVarSource{
				SecretKeyRef: &v1.SecretKeySelector{
					LocalObjectReference: v1.LocalObjectReference{
						Name: "secret-env",
					},
					Key: "username",
				},
			},
			container:  nil,
			pod:        nil,
			configMaps: nil,
			secrets: &v1.SecretList{
				Items: []v1.Secret{
					{
						ObjectMeta: metaV1.ObjectMeta{
							Name: "secret-env",
						},
						Data: map[string][]byte{
							"username": []byte("top-secret"),
						},
					},
				},
			},
			expected: base64.StdEncoding.EncodeToString([]byte("top-secret")),
		},
		{
			src: &v1.EnvVarSource{
				ConfigMapKeyRef: &v1.ConfigMapKeySelector{
					LocalObjectReference: v1.LocalObjectReference{
						Name: "config-map-env",
					},
					Key: "username",
				},
			},
			container: nil,
			pod:       nil,
			configMaps: &v1.ConfigMapList{
				Items: []v1.ConfigMap{
					{
						ObjectMeta: metaV1.ObjectMeta{
							Name: "config-map-env",
						},
						Data: map[string]string{
							"username": "joey",
						},
					},
				},
			},
			secrets:  nil,
			expected: "joey",
		},
	}

	for _, c := range cases {
		dataselect.DefaultDataSelectWithMetrics.MetricQuery = dataselect.NoMetrics
		actual := evalValueFrom(c.src, c.container, c.pod, c.configMaps, c.secrets)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetPodDetail(%#v, %#v, %#v, %#v, %#v) == \ngot %#v, \nexpected %#v",
				c.src, c.container, c.pod, c.configMaps, c.secrets, actual, c.expected)
		}
	}
}
