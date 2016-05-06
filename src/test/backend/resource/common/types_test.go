package common

import (
	"reflect"
	"testing"

	"k8s.io/kubernetes/pkg/api"
)

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
