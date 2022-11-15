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

package role

import (
	"context"

	rbac "k8s.io/api/rbac/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sClient "k8s.io/client-go/kubernetes"
)

// RoleDetail contains Role details.
type RoleDetail struct {
	// Extends list item structure.
	Role `json:",inline"`

	Rules []rbac.PolicyRule `json:"rules"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// GetRoleDetail gets Role details.
func GetRoleDetail(client k8sClient.Interface, namespace, name string) (*RoleDetail, error) {
	rawObject, err := client.RbacV1().Roles(namespace).Get(context.TODO(), name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	cr := toRoleDetail(*rawObject)
	return &cr, nil
}

func toRoleDetail(cr rbac.Role) RoleDetail {
	return RoleDetail{
		Role:   toRole(cr),
		Rules:  cr.Rules,
		Errors: []error{},
	}
}
