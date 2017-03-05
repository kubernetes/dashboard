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
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	api "k8s.io/client-go/pkg/api/v1"
)

// ResourceStatus provides the status of the resource defined by a resource quota.
type ResourceStatus struct {
	Used string `json:"used,omitempty"`
	Hard string `json:"hard,omitempty"`
}

// ResourceQuotaDetail provides the presentation layer view of Kubernetes Resource Quotas resource.
type ResourceQuotaDetail struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Scopes defines quota scopes
	Scopes []api.ResourceQuotaScope `json:"scopes,omitempty"`

	// StatusList is a set of (resource name, Used, Hard) tuple.
	StatusList map[api.ResourceName]ResourceStatus `json:"statusList,omitempty"`
}

// ResourceQuotaDetailList
type ResourceQuotaDetailList struct {
	ListMeta common.ListMeta       `json:"listMeta"`
	Items    []ResourceQuotaDetail `json:"items"`
}

func ToResourceQuotaDetail(rawResourceQuota *api.ResourceQuota) *ResourceQuotaDetail {
	statusList := make(map[api.ResourceName]ResourceStatus)

	for key, value := range rawResourceQuota.Status.Hard {
		used := rawResourceQuota.Status.Used[key]
		statusList[key] = ResourceStatus{
			Used: used.String(),
			Hard: value.String(),
		}
	}
	return &ResourceQuotaDetail{
		ObjectMeta: common.NewObjectMeta(rawResourceQuota.ObjectMeta),
		TypeMeta:   common.NewTypeMeta(common.ResourceKindResourceQuota),
		Scopes:     rawResourceQuota.Spec.Scopes,
		StatusList: statusList,
	}
}
