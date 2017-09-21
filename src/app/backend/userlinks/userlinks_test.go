package userlinks

import (
	"reflect"
	"testing"

	"strconv"

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
				UserLink{Description: "absolute_path", Link: "http://monitoring.com/debug/requests", Valid: true},
				UserLink{Description: "invalid", Link: "Invalid User Link: http://{{apirver-proxy-url}}/debug/requests", Valid: false},
				UserLink{Description: "invalid2", Link: "Invalid User Link: ://www.logs.com/click/here", Valid: false},
				UserLink{Description: "debug", Link: "http://localhost:8080/api/v1/namespaces/ns-1/services/svc-1/proxy/debug/requests", Valid: true},
				UserLink{Description: "debug2", Link: "http://localhost:8080/api/v1/namespaces/ns-1/services/svc-1/proxy/debug/requests", Valid: true}},
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
				UserLink{Description: "ingress", Link: "http://127.0.0.1:55/debug/request", Valid: true},
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.service)

		actual, _ := GetUserLinks(fakeClient, c.namespace, c.name, c.resource, c.host)

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
			pod: &v1.Pod{ObjectMeta: metaV1.ObjectMeta{
				Name: "pod-1", Namespace: "ns-1",
				Annotations: map[string]string{
					"alpha.dashboard.kubernetes.io/links": "{" +
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
				UserLink{Description: "absolute_path", Link: "http://monitoring.com/debug/requests", Valid: true},
				UserLink{Description: "invalid", Link: "Invalid User Link: http://{{apirver-proxy-url}}/debug/requests", Valid: false},
				UserLink{Description: "invalid2", Link: "Invalid User Link: ://www.logs.com/click/here", Valid: false},
				UserLink{Description: "debug", Link: "http://localhost:8080/api/v1/namespaces/ns-1/pods/pod-1/proxy/debug/requests", Valid: true},
				UserLink{Description: "debug2", Link: "http://localhost:8080/api/v1/namespaces/ns-1/pods/pod-1/proxy/debug/requests", Valid: true}},
		},
	}

	for _, c := range cases {

		fakeClient := fake.NewSimpleClientset(c.pod)
		actual, _ := GetUserLinks(fakeClient, c.namespace, c.name, c.resource, c.host)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetUserLinksForPod(client,%#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.namespace, c.name, actual, c.expected)
		}
	}
}
