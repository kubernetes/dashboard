package common

import (
	"reflect"
	"testing"

	"k8s.io/kubernetes/pkg/api"
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
