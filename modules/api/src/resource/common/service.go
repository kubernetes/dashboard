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
	"github.com/kubernetes/dashboard/src/app/backend/api"
	v1 "k8s.io/api/core/v1"
)

// FilterNamespacedServicesBySelector returns services targeted by given resource selector in
// given namespace.
func FilterNamespacedServicesBySelector(services []v1.Service, namespace string,
	resourceSelector map[string]string) []v1.Service {

	var matchingServices []v1.Service
	for _, service := range services {
		if service.ObjectMeta.Namespace == namespace &&
			api.IsSelectorMatching(service.Spec.Selector, resourceSelector) {
			matchingServices = append(matchingServices, service)
		}
	}

	return matchingServices
}
