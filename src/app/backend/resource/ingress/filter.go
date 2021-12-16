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

package ingress

import (
	"github.com/kubernetes/dashboard/src/app/backend/api"
	networkingv1 "k8s.io/api/networking/v1"
)

func FilterIngressByService(ingresses []networkingv1.Ingress, serviceName string) []networkingv1.Ingress {
	var matchingIngresses []networkingv1.Ingress
	for _, ingress := range ingresses {
		if ingressMatchesServiceName(ingress, serviceName) {
			matchingIngresses = append(matchingIngresses, ingress)
		}
	}
	return matchingIngresses
}

func ingressMatchesServiceName(ingress networkingv1.Ingress, serviceName string) bool {
	spec := ingress.Spec
	if ingressBackendMatchesServiceName(spec.DefaultBackend, serviceName) {
		return true
	}

	for _, rule := range spec.Rules {
		for _, path := range rule.IngressRuleValue.HTTP.Paths {
			if ingressBackendMatchesServiceName(&path.Backend, serviceName) {
				return true
			}
		}
	}
	return false
}

func ingressBackendMatchesServiceName(ingressBackend *networkingv1.IngressBackend, serviceName string) bool {
	if ingressBackend == nil {
		return false
	}

	if ingressBackend.Service != nil && ingressBackend.Service.Name == serviceName {
		return true
	}

	if ingressBackend.Resource != nil && ingressBackend.Resource.Kind == api.ResourceKindService && ingressBackend.Resource.Name == serviceName {
		return true
	}
	return false
}
