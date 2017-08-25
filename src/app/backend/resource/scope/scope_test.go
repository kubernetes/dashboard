// Copyright 2015 Google Inc. All Rights Reserved.
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

package scope

import (
	"testing"

	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
	"k8s.io/client-go/kubernetes/fake"
	api "k8s.io/client-go/pkg/api/v1"
)

func TestGetScope(t *testing.T) {

	svcs := &api.ServiceList{Items: []api.Service{
		{
			ObjectMeta: metaV1.ObjectMeta{
				Name:      "weave-scope",
				Namespace: "kube-system",
				Labels:    map[string]string{"name": "weave-scope-app"},
			},
			Spec: api.ServiceSpec{
				Type: api.ServiceTypeNodePort,
				Ports: []api.ServicePort{{
					Name:       "weave-scope",
					Protocol:   api.ProtocolTCP,
					Port:       4040,
					TargetPort: intstr.FromInt(80),
					NodePort:   30220,
				}},
			},
		},
	}}

	pods := &api.PodList{Items: []api.Pod{
		{
			ObjectMeta: metaV1.ObjectMeta{
				Name:      "weave-scope",
				Namespace: "kube-system",
				Labels:    map[string]string{"name": "weave-scope-app"},
			},
			Spec: api.PodSpec{
				Volumes: []api.Volume{{
					Name: "basic",
				}},
				InitContainers:     []api.Container{},
				Containers:         []api.Container{},
				ServiceAccountName: "admin",
			},
			Status: api.PodStatus{
				HostIP: "localhost",
				Phase:  "Running",
			},
		},
	}}

	fakeClient := fake.NewSimpleClientset(pods, svcs)
	actual, _ := GetScope(fakeClient)

	if actual.Deployed != true {
		t.Errorf("Scope was deployed but wasn't verified as deployed: %s", actual.Deployed)
	}
	if actual.Address != "http://localhost:30220" {
		t.Errorf("Scope was deployed but the address was unverifiable: %s", actual.Address)
	}
}
