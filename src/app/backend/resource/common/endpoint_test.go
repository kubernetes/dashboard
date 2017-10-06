// Copyright 2017 The Kubernetes Authors.
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

package common

import (
	"reflect"
	"testing"

	api "k8s.io/api/core/v1"
)

func TestGetExternalEndpoints(t *testing.T) {
	labelSelectorMap := make(map[string]string)
	labelSelectorMap["name"] = "app-name"
	cases := []struct {
		service  api.Service
		expected []Endpoint
	}{
		{
			api.Service{
				Spec: api.ServiceSpec{
					Type: api.ServiceTypeLoadBalancer,
					Ports: []api.ServicePort{
						{
							Protocol: "TCP",
							Port:     30100,
						},
						{
							Protocol: "TCP",
							Port:     30101,
						},
					},
				},
				Status: api.ServiceStatus{
					LoadBalancer: api.LoadBalancerStatus{
						Ingress: []api.LoadBalancerIngress{{
							Hostname: "foo",
						}},
					},
				},
			},
			[]Endpoint{
				{
					Host: "foo",
					Ports: []ServicePort{
						{
							Port: 30100, Protocol: "TCP",
						},
						{
							Port: 30101, Protocol: "TCP",
						},
					},
				},
			},
		},
	}
	for _, c := range cases {
		actual := GetExternalEndpoints(&c.service)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetExternalEndpoints(%+v) == %+v, expected %+v",
				&c.service, actual, c.expected)
		}
	}
}

func TestGetInternalEndpoint(t *testing.T) {
	cases := []struct {
		serviceName, namespace string
		ports                  []api.ServicePort
		expected               Endpoint
	}{
		{"my-service", api.NamespaceDefault, nil, Endpoint{Host: "my-service"}},
		{"my-service", api.NamespaceDefault,
			[]api.ServicePort{{Name: "foo", Port: 8080, Protocol: "TCP"}},
			Endpoint{Host: "my-service", Ports: []ServicePort{{Port: 8080, Protocol: "TCP"}}}},
		{"my-service", "my-namespace", nil, Endpoint{Host: "my-service.my-namespace"}},
		{"my-service", "my-namespace",
			[]api.ServicePort{{Name: "foo", Port: 8080, Protocol: "TCP"}},
			Endpoint{Host: "my-service.my-namespace",
				Ports: []ServicePort{{Port: 8080, Protocol: "TCP"}}}},
	}
	for _, c := range cases {
		actual := GetInternalEndpoint(c.serviceName, c.namespace, c.ports)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getInternalEndpoint(%+v, %+v, %+v) == %+v, expected %+v",
				c.serviceName, c.namespace, c.ports, actual, c.expected)
		}
	}
}

func TestGetExternalEndpoint(t *testing.T) {
	cases := []struct {
		serviceIp api.LoadBalancerIngress
		ports     []api.ServicePort
		expected  Endpoint
	}{
		{api.LoadBalancerIngress{IP: "127.0.0.1"}, nil, Endpoint{Host: "127.0.0.1"}},
		{api.LoadBalancerIngress{IP: "127.0.0.1", Hostname: "host"}, nil, Endpoint{Host: "host"}},
		{api.LoadBalancerIngress{IP: "127.0.0.1"},
			[]api.ServicePort{{Name: "foo", Port: 8080, Protocol: "TCP"}},
			Endpoint{Host: "127.0.0.1", Ports: []ServicePort{{Port: 8080, Protocol: "TCP"}}}},
	}

	for _, c := range cases {
		actual := getExternalEndpoint(c.serviceIp, c.ports)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getExternalEndpoint(%+v, %+v) == %+v, expected %+v",
				c.serviceIp, c.ports, actual, c.expected)
		}
	}
}
