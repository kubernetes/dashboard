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

func TestGetServicePorts(t *testing.T) {
	cases := []struct {
		apiPorts []api.ServicePort
		expected []ServicePort
	}{
		{[]api.ServicePort{}, nil},
		{
			[]api.ServicePort{
				{Port: 123, Protocol: api.ProtocolTCP},
				{Port: 1, Protocol: api.ProtocolUDP},
				{Port: 5, Protocol: api.ProtocolUDP},
			},
			[]ServicePort{
				{Port: 123, Protocol: api.ProtocolTCP},
				{Port: 1, Protocol: api.ProtocolUDP},
				{Port: 5, Protocol: api.ProtocolUDP},
			},
		},
	}

	for _, c := range cases {
		actual := GetServicePorts(c.apiPorts)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetServicePorts(%#v) == \ngot %#v, \nexpected %#v",
				c.apiPorts, actual, c.expected)
		}
	}
}
