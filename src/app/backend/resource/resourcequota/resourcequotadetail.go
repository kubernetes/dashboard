// Copyright 2015 Google Inc. All Rights Reserved.
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

package resourcequota

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/api"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// ResourceQuotaDetail provides the presentation layer view of Kubernetes Resource Quotas resource.
type ResourceQuotaDetail struct {
	ObjectMeta common.ObjectMeta `json:objectMeta`
	TypeMeta   common.TypeMeta   `json:typeMeta`

	// Spec defines the desired quota
	Spec api.ResourceQuotaSpec `json:"spec,omitempty"`

	// Status defines the actual enforced quota and its current usage
	Status api.ResourceQuotaStatus `json:"status,omitempty"`
}

// GetResourceQuotaDetail returns returns detailed information about a resource quota
func GetResourceQuotaDetail(client *client.Client, namespace, name string) (*ResourceQuotaDetail, error) {
	log.Printf("Getting details of %s resource quota in %s namespace", name, namespace)

	rawResourceQuota, err := client.ResourceQuotas(namespace).Get(name)

	if err != nil {
		return nil, err
	}

	return getResourceQuotaDetail(rawResourceQuota), nil
}

func getResourceQuotaDetail(rawResourceQuota *api.ResourceQuota) *ResourceQuotaDetail {
	return &ResourceQuotaDetail{
		ObjectMeta: common.NewObjectMeta(rawResourceQuota.ObjectMeta),
		TypeMeta:   common.NewTypeMeta(common.ResourceKindResourceQuota),
		Spec:       rawResourceQuota.Spec,
		Status:     rawResourceQuota.Status,
	}
}
