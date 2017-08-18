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
// k8s.io/apimachinery/pkg/apis/meta/v1/controller_ref_test.go

package common

import (
	"testing"

	"k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
)

type metaObj struct {
	v1.ObjectMeta
	v1.TypeMeta
}

func newControllerRef(owner v1.Object, gvk schema.GroupVersionKind) *v1.OwnerReference {
	blockOwnerDeletion := true
	isController := true
	return &v1.OwnerReference{
		APIVersion:         gvk.GroupVersion().String(),
		Kind:               gvk.Kind,
		Name:               owner.GetName(),
		UID:                owner.GetUID(),
		BlockOwnerDeletion: &blockOwnerDeletion,
		Controller:         &isController,
	}
}

func TestGetControllerOf(t *testing.T) {
	gvk := schema.GroupVersionKind{
		Group:   "group",
		Version: "v1",
		Kind:    "Kind",
	}
	obj1 := &metaObj{
		ObjectMeta: v1.ObjectMeta{
			UID:  "uid1",
			Name: "name1",
		},
	}
	controllerRef := newControllerRef(obj1, gvk)
	var falseRef = false
	obj2 := &metaObj{
		ObjectMeta: v1.ObjectMeta{
			UID:  "uid2",
			Name: "name1",
			OwnerReferences: []v1.OwnerReference{
				{
					Name:       "owner1",
					Controller: &falseRef,
				},
				*controllerRef,
				{
					Name:       "owner2",
					Controller: &falseRef,
				},
			},
		},
	}

	if GetControllerOf(obj1) != nil {
		t.Error("GetControllerOf must return null")
	}
	c := GetControllerOf(obj2)
	if c.Name != controllerRef.Name || c.UID != controllerRef.UID {
		t.Errorf("Incorrect result of GetControllerOf: %v", c)
	}
}

func TestIsControlledBy(t *testing.T) {
	gvk := schema.GroupVersionKind{
		Group:   "group",
		Version: "v1",
		Kind:    "Kind",
	}
	obj1 := &metaObj{
		ObjectMeta: v1.ObjectMeta{
			UID: "uid1",
		},
	}
	obj2 := &metaObj{
		ObjectMeta: v1.ObjectMeta{
			UID: "uid2",
			OwnerReferences: []v1.OwnerReference{
				*newControllerRef(obj1, gvk),
			},
		},
	}
	obj3 := &metaObj{
		ObjectMeta: v1.ObjectMeta{
			UID: "uid3",
			OwnerReferences: []v1.OwnerReference{
				*newControllerRef(obj2, gvk),
			},
		},
	}
	if !IsControlledBy(obj2, obj1) || !IsControlledBy(obj3, obj2) {
		t.Error("Incorrect IsControlledBy result: false")
	}
	if IsControlledBy(obj3, obj1) {
		t.Error("Incorrect IsControlledBy result: true")
	}
}
