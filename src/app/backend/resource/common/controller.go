/*
Copyright 2016 The Kubernetes Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


// Copied from: https://github.com/kubernetes/kubernetes/blob/master/staging/src/
// k8s.io/apimachinery/pkg/apis/meta/v1/controller_ref.go

package common

import "k8s.io/apimachinery/pkg/apis/meta/v1"

// IsControlledBy checks if the  object has a controllerRef set to the given owner.
func IsControlledBy(obj v1.Object, owner v1.Object) bool {
	ref := GetControllerOf(obj)
	if ref == nil {
		return false
	}
	return ref.UID == owner.GetUID()
}

// GetControllerOf returns a pointer to a copy of the controllerRef if controllee has a controller.
func GetControllerOf(controllee v1.Object) *v1.OwnerReference {
	for _, ref := range controllee.GetOwnerReferences() {
		if ref.Controller != nil && *ref.Controller {
			return &ref
		}
	}
	return nil
}
