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

func TestIsLabelSelectorMatching(t *testing.T) {
	cases := []struct {
		serviceSelector, replicationControllerSelector map[string]string
		expected                                       bool
	}{
		{nil, nil, false},
		{nil, map[string]string{}, false},
		{map[string]string{}, nil, false},
		{map[string]string{}, map[string]string{}, false},
		{map[string]string{"app": "my-name"}, map[string]string{}, false},
		{map[string]string{"app": "my-name", "version": "2"},
			map[string]string{"app": "my-name", "version": "1.1"}, false},
		{map[string]string{"app": "my-name", "env": "prod"},
			map[string]string{"app": "my-name", "version": "1.1"}, false},
		{map[string]string{"app": "my-name"}, map[string]string{"app": "my-name"}, true},
		{map[string]string{"app": "my-name", "version": "1.1"},
			map[string]string{"app": "my-name", "version": "1.1"}, true},
		{map[string]string{"app": "my-name"},
			map[string]string{"app": "my-name", "version": "1.1"}, true},
	}
	for _, c := range cases {
		actual := IsLabelSelectorMatching(c.serviceSelector, c.replicationControllerSelector)
		if actual != c.expected {
			t.Errorf("isLabelSelectorMatching(%+v, %+v) == %+v, expected %+v",
				c.serviceSelector, c.replicationControllerSelector, actual, c.expected)
		}
	}
}

func TestFilterPodsBySelector(t *testing.T) {
	firstLabelSelectorMap := make(map[string]string)
	firstLabelSelectorMap["name"] = "app-name-first"
	secondLabelSelectorMap := make(map[string]string)
	secondLabelSelectorMap["name"] = "app-name-second"

	cases := []struct {
		selector map[string]string
		pods     []api.Pod
		expected []api.Pod
	}{
		{
			firstLabelSelectorMap,
			[]api.Pod{
				{
					ObjectMeta: api.ObjectMeta{
						Name:   "first-pod-ok",
						Labels: firstLabelSelectorMap,
					},
				},
				{
					ObjectMeta: api.ObjectMeta{
						Name:   "second-pod-ok",
						Labels: firstLabelSelectorMap,
					},
				},
				{
					ObjectMeta: api.ObjectMeta{
						Name:   "third-pod-wrong",
						Labels: secondLabelSelectorMap,
					},
				},
			},
			[]api.Pod{
				{
					ObjectMeta: api.ObjectMeta{
						Name:   "first-pod-ok",
						Labels: firstLabelSelectorMap,
					},
				},
				{
					ObjectMeta: api.ObjectMeta{
						Name:   "second-pod-ok",
						Labels: firstLabelSelectorMap,
					},
				},
			},
		},
	}
	for _, c := range cases {
		actual := FilterPodsBySelector(c.pods, c.selector)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("FilterPodsBySelector(%+v, %+v) == %+v, expected %+v",
				c.pods, c.selector, actual, c.expected)
		}
	}
}

func TestFilterNamespacedPodsBySelector(t *testing.T) {
	firstLabelSelectorMap := make(map[string]string)
	firstLabelSelectorMap["name"] = "app-name-first"
	secondLabelSelectorMap := make(map[string]string)
	secondLabelSelectorMap["name"] = "app-name-second"

	cases := []struct {
		selector  map[string]string
		namespace string
		pods      []api.Pod
		expected  []api.Pod
	}{
		{
			firstLabelSelectorMap, "test-ns-1",
			[]api.Pod{
				{
					ObjectMeta: api.ObjectMeta{
						Name:      "first-pod-ok",
						Labels:    firstLabelSelectorMap,
						Namespace: "test-ns-1",
					},
				},
				{
					ObjectMeta: api.ObjectMeta{
						Name:      "second-pod-ok",
						Labels:    firstLabelSelectorMap,
						Namespace: "test-ns-2",
					},
				},
				{
					ObjectMeta: api.ObjectMeta{
						Name:   "third-pod-wrong",
						Labels: secondLabelSelectorMap,
					},
				},
			},
			[]api.Pod{
				{
					ObjectMeta: api.ObjectMeta{
						Name:      "first-pod-ok",
						Labels:    firstLabelSelectorMap,
						Namespace: "test-ns-1",
					},
				},
			},
		},
	}
	for _, c := range cases {
		actual := FilterNamespacedPodsBySelector(c.pods, c.namespace, c.selector)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("FilterNamespacedPodsBySelector(%+v, %+v) == %+v, expected %+v",
				c.pods, c.selector, actual, c.expected)
		}
	}
}
