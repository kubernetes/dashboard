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

package resourcequota

import (
	"github.com/kubernetes/dashboard/src/app/backend/api"
	v1 "k8s.io/api/core/v1"
)

// ResourceStatus provides the status of the resource defined by a resource quota.
type ResourceStatus struct {
	Used string `json:"used,omitempty"`
	Hard string `json:"hard,omitempty"`
}

// ResourceQuotaDetail provides the presentation layer view of Kubernetes Resource Quotas resource.
type ResourceQuotaDetail struct {
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
	TypeMeta   api.TypeMeta   `json:"typeMeta"`

	// Scopes defines quota scopes
	Scopes []v1.ResourceQuotaScope `json:"scopes,omitempty"`

	// StatusList is a set of (resource name, Used, Hard) tuple.
	StatusList map[v1.ResourceName]ResourceStatus `json:"statusList,omitempty"`
}

// ResourceQuotaDetailList provides a set of resource Quotas.
type ResourceQuotaDetailList struct {
	ListMeta api.ListMeta          `json:"listMeta"`
	Items    []ResourceQuotaDetail `json:"items"`
}

func ToResourceQuotaDetail(rawResourceQuota *v1.ResourceQuota) *ResourceQuotaDetail {
	statusList := make(map[v1.ResourceName]ResourceStatus)

	for key, value := range rawResourceQuota.Status.Hard {
		used := rawResourceQuota.Status.Used[key]
		statusList[key] = ResourceStatus{
			Used: used.String(),
			Hard: value.String(),
		}
	}
	return &ResourceQuotaDetail{
		ObjectMeta: api.NewObjectMeta(rawResourceQuota.ObjectMeta),
		TypeMeta:   api.NewTypeMeta(api.ResourceKindResourceQuota),
		Scopes:     rawResourceQuota.Spec.Scopes,
		StatusList: statusList,
	}
}
