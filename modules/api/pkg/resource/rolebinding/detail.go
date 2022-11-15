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

package rolebinding

import (
	"context"

	rbac "k8s.io/api/rbac/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sClient "k8s.io/client-go/kubernetes"
)

// RoleBindingDetail contains RoleBinding details.
type RoleBindingDetail struct {
	// Extends list item structure.
	RoleBinding `json:",inline"`

	Subjects []rbac.Subject `json:"subjects,omitempty" protobuf:"bytes,2,rep,name=subjects"`

	RoleRef rbac.RoleRef `json:"roleRef" protobuf:"bytes,3,opt,name=roleRef"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// GetRoleBindingDetail gets RoleBinding details.
func GetRoleBindingDetail(client k8sClient.Interface, namespace, name string) (*RoleBindingDetail, error) {
	rawObject, err := client.RbacV1().RoleBindings(namespace).Get(context.TODO(), name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	cr := toRoleBindingDetail(*rawObject)
	return &cr, nil
}

func toRoleBindingDetail(cr rbac.RoleBinding) RoleBindingDetail {
	return RoleBindingDetail{
		RoleBinding: toRoleBinding(cr),
		Subjects:    cr.Subjects,
		RoleRef:     cr.RoleRef,
		Errors:      []error{},
	}
}
