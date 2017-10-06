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

package validation

import (
	"fmt"
	"sort"

	auth "k8s.io/api/authorization/v1beta1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

// RBACStatus describes status of RBAC in the cluster.
type RbacStatus struct {
	// True when RBACs are enabled in the cluster.
	Enabled bool `json:"enabled"`
}

// ValidateRBACStatus validates if RBACs are enabled in the cluster.
// Supported version of RBAC api is: 'rbac.authorization.k8s.io/v1beta1'
func ValidateRbacStatus(client kubernetes.Interface) (*RbacStatus, error) {
	groupList, err := client.Discovery().ServerGroups()
	if err != nil {
		return nil, fmt.Errorf("Couldn't get available api versions from server: %v", err)
	}

	apiVersions := metav1.ExtractGroupVersions(groupList)
	return &RbacStatus{
		Enabled: contains(apiVersions, auth.SchemeGroupVersion.String()),
	}, nil
}

// Returns true if element has been found in given array, false otherwise.
func contains(arr []string, str string) bool {
	sort.Strings(arr)
	idx := sort.SearchStrings(arr, str)
	return len(arr) > 0 && idx < len(arr) && arr[idx] == str
}
