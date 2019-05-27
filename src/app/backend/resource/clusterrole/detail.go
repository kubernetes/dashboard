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

package clusterrole

import (
	"context"

	rbac "k8s.io/api/rbac/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	ctrlruntimeclient "sigs.k8s.io/controller-runtime/pkg/client"
)

// ClusterRoleDetail contains Cron Job details.
type ClusterRoleDetail struct {
	// Extends list item structure.
	ClusterRole `json:",inline"`

	Rules []rbac.PolicyRule `json:"rules"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// GetClusterRoleDetail gets Cluster Role details.
func GetClusterRoleDetail(client ctrlruntimeclient.Client, name string) (*ClusterRoleDetail, error) {
	rawObject := &rbac.ClusterRole{}
	if err := client.Get(context.TODO(), ctrlruntimeclient.ObjectKey{Namespace: metav1.NamespaceAll, Name: name}, rawObject); err != nil {
		return nil, err
	}

	cr := toClusterRoleDetail(*rawObject)
	return &cr, nil
}

func toClusterRoleDetail(cr rbac.ClusterRole) ClusterRoleDetail {
	return ClusterRoleDetail{
		ClusterRole: toClusterRole(cr),
		Rules:       cr.Rules,
		Errors:      []error{},
	}
}
