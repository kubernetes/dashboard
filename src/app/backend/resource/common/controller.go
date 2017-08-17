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
