// Copyright 2017 The Kubernetes Dashboard Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package userlinks

import (
	"reflect"
	"testing"

	"strconv"

	"sort"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
	"k8s.io/client-go/pkg/api/v1"
)

func TestGetUserLinksForService(t *testing.T) {
	cases := []struct {
		service                         *v1.Service
		namespace, name, resource, host string
		expected                        []UserLink
	}{
		{
			service: &v1.Service{
				ObjectMeta: metaV1.ObjectMeta{
					Name: "svc-1", Namespace: "ns-1",
					Annotations: map[string]string{
						"alpha.dashboard.kubernetes.io/links": "{" +
							strconv.Quote("dns-svc") + ":" +
							strconv.Quote("http://{{svc.dns_name}}:80/debug") + "," +
							strconv.Quote("absolute_path") + ":" +
							strconv.Quote("http://monitoring.com/debug/requests") + "," +
							strconv.Quote("invalid") + ":" +
							strconv.Quote("http://{{apirver-proxy-url}}/debug/requests") + "," +
							strconv.Quote("invalid2") + ":" +
							strconv.Quote("://www.logs.com/click/here") + "," +
							strconv.Quote("debug") + ":" +
							strconv.Quote("http://{{apiserver-proxy-url}}/debug/requests") + "," +
							strconv.Quote("debug2") + ":" +
							strconv.Quote("http://{{apiserver-proxy-url}}/debug/requests") + "}"},
				}},
			namespace: "ns-1", name: "svc-1", resource: api.ResourceKindService, host: "http://localhost:8080",
			expected: []UserLink{
				UserLink{Description: "dns-svc", Link: "svc-1.ns-1.svc.cluster.local:80/debug", IsURLValid: true},
				UserLink{Description: "absolute_path", Link: "http://monitoring.com/debug/requests", IsURLValid: true},
				UserLink{Description: "invalid", Link: "Invalid User Link: http://{{apirver-proxy-url}}/debug/requests", IsURLValid: false},
				UserLink{Description: "invalid2", Link: "Invalid User Link: ://www.logs.com/click/here", IsURLValid: false},
				UserLink{Description: "debug", Link: "http://localhost:8080/api/v1/namespaces/ns-1/services/svc-1/proxy/debug/requests", IsURLValid: true, IsProxyURL: true},
				UserLink{Description: "debug2", Link: "http://localhost:8080/api/v1/namespaces/ns-1/services/svc-1/proxy/debug/requests", IsURLValid: true, IsProxyURL: true}},
		},
		{
			service: &v1.Service{
				ObjectMeta: metaV1.ObjectMeta{
					Name: "svc-2", Namespace: "ns-2",
					Annotations: map[string]string{
						"alpha.dashboard.kubernetes.io/links": "{" +
							strconv.Quote("ingress") + ":" +
							strconv.Quote("/debug/request") + "}"},
				},
				Spec:   v1.ServiceSpec{Ports: []v1.ServicePort{v1.ServicePort{Port: 55}}},
				Status: v1.ServiceStatus{LoadBalancer: v1.LoadBalancerStatus{Ingress: []v1.LoadBalancerIngress{v1.LoadBalancerIngress{IP: "127.0.0.1"}}}},
			},
			namespace: "ns-2", name: "svc-2", resource: api.ResourceKindService, host: "http://localhost:8080",
			expected: []UserLink{
				UserLink{Description: "ingress", Link: "http://127.0.0.1:55/debug/request", IsURLValid: true},
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.service)

		actual, _ := GetUserLinks(fakeClient, c.namespace, c.name, c.resource, c.host)

		sort.Slice(actual, func(i, j int) bool {
			return actual[i].Description < actual[j].Description
		})
		sort.Slice(c.expected, func(i, j int) bool {
			return c.expected[i].Description < c.expected[j].Description
		})

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetUserLinksForService(client,%#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.namespace, c.name, actual, c.expected)
		}
	}
}

func TestGetUserLinksForPod(t *testing.T) {
	cases := []struct {
		pod                             *v1.Pod
		namespace, name, resource, host string
		expected                        []UserLink
	}{
		{
			pod: &v1.Pod{
				Status: v1.PodStatus{PodIP: "1.2.3.4"},
				ObjectMeta: metaV1.ObjectMeta{
					Name: "pod-1", Namespace: "ns-1",
					Annotations: map[string]string{
						"alpha.dashboard.kubernetes.io/links": "{" +
							strconv.Quote("pod-dns") + ":" +
							strconv.Quote("http://{{pod.dns_name}}:80/debug") + "," +
							strconv.Quote("absolute_path") + ":" +
							strconv.Quote("http://monitoring.com/debug/requests") + "," +
							strconv.Quote("invalid") + ":" +
							strconv.Quote("http://{{apirver-proxy-url}}/debug/requests") + "," +
							strconv.Quote("invalid2") + ":" +
							strconv.Quote("://www.logs.com/click/here") + "," +
							strconv.Quote("debug") + ":" +
							strconv.Quote("http://{{apiserver-proxy-url}}/debug/requests") + "," +
							strconv.Quote("debug2") + ":" +
							strconv.Quote("http://{{apiserver-proxy-url}}/debug/requests") + "}"},
				}},
			namespace: "ns-1", name: "pod-1", resource: api.ResourceKindPod, host: "http://localhost:8080",
			expected: []UserLink{
				UserLink{Description: "absolute_path", Link: "http://monitoring.com/debug/requests", IsURLValid: true},
				UserLink{Description: "invalid", Link: "Invalid User Link: http://{{apirver-proxy-url}}/debug/requests", IsURLValid: false},
				UserLink{Description: "invalid2", Link: "Invalid User Link: ://www.logs.com/click/here", IsURLValid: false},
				UserLink{Description: "debug", Link: "http://localhost:8080/api/v1/namespaces/ns-1/pods/pod-1/proxy/debug/requests", IsURLValid: true, IsProxyURL: true},
				UserLink{Description: "debug2", Link: "http://localhost:8080/api/v1/namespaces/ns-1/pods/pod-1/proxy/debug/requests", IsURLValid: true, IsProxyURL: true},
				UserLink{Description: "pod-dns", Link: "1-2-3-4.ns-1.pod.cluster.local:80/debug", IsURLValid: true}},
		},
	}

	for _, c := range cases {

		fakeClient := fake.NewSimpleClientset(c.pod)
		actual, _ := GetUserLinks(fakeClient, c.namespace, c.name, c.resource, c.host)

		// since order of the "actual" slice cannot be predicted we sort both slice so that the correct indices are compared
		sort.Slice(actual, func(i, j int) bool {
			return actual[i].Description < actual[j].Description
		})
		sort.Slice(c.expected, func(i, j int) bool {
			return c.expected[i].Description < c.expected[j].Description
		})

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetUserLinksForPod(client,%#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.namespace, c.name, actual, c.expected)
		}
	}
}
