package api

import "k8s.io/api/authorization/v1"

// ToSelfSubjectAccessReview creates kubernetes API object based on provided data.
func ToSelfSubjectAccessReview(namespace, name, resource, verb string) *v1.SelfSubjectAccessReview {
	return &v1.SelfSubjectAccessReview{
		Spec: v1.SelfSubjectAccessReviewSpec{
			ResourceAttributes: &v1.ResourceAttributes{
				Namespace: namespace,
				Name:      name,
				Resource:  resource,
				Verb:      verb,
			},
		},
	}
}
