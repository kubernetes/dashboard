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

package limitrange

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/api"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// LimitRangeDetail provides the presentation layer view of Kubernetes Limit Ranges resource.
type LimitRangeDetail struct {
	ObjectMeta common.ObjectMeta `json:objectMeta`
	TypeMeta   common.TypeMeta   `json:typeMeta`

	LimitRanges limitRanges `json:"limitsRanges,omitempty"`
}

// limitRanges provides set of limit ranges by limit types and resource names
type limitRanges map[api.LimitType]rangeMap

// rangeMap provides limit ranges by resource name
type rangeMap map[api.ResourceName]*limitRange

func (rMap rangeMap) getRange(resource api.ResourceName) *limitRange {
	r, ok := rMap[resource]
	if !ok {
		return &limitRange{}
	} else {
		return r
	}
}

// limitRange provides resource limit range values
type limitRange struct {
	// Min usage constraints on this kind by resource name
	Min string `json:"min,omitempty"`
	// Max usage constraints on this kind by resource name
	Max string `json:"max,omitempty"`
	// Default resource requirement limit value by resource name.
	Default string `json:"default,omitempty"`
	// DefaultRequest resource requirement request value by resource name.
	DefaultRequest string `json:"defaultRequest,omitempty"`
	// MaxLimitRequestRatio represents the max burst value for the named resource
	MaxLimitRequestRatio string `json:"maxLimitRequestRatio,omitempty"`
}

// GetLimitRangeDetail returns returns detailed information about a limit range
func GetLimitRangeDetail(client *client.Client, namespace, name string) (*LimitRangeDetail, error) {
	log.Printf("Getting details of %s limit range in %s namespace", name, namespace)

	rawLimitRange, err := client.LimitRanges(namespace).Get(name)

	if err != nil {
		return nil, err
	}

	return getLimitRangeDetail(rawLimitRange), nil
}

func getLimitRangeDetail(rawLimitRange *api.LimitRange) *LimitRangeDetail {
	return &LimitRangeDetail{
		ObjectMeta:  common.NewObjectMeta(rawLimitRange.ObjectMeta),
		TypeMeta:    common.NewTypeMeta(common.ResourceKindLimitRange),
		LimitRanges: toLimitRanges(rawLimitRange.Spec.Limits),
	}
}

// toLimitRanges converts array of api.LimitRangeItem to LimitRanges
func toLimitRanges(rawLimitRanges []api.LimitRangeItem) limitRanges {

	limitRanges := make(limitRanges, len(rawLimitRanges))

	for _, rawLimitRange := range rawLimitRanges {

		rangeMap := make(rangeMap)

		for resource, min := range rawLimitRange.Min {
			rangeMap[resource] = &limitRange{Min: min.String()}
		}

		for resource, max := range rawLimitRange.Max {
			rangeMap.getRange(resource).Max = max.String()
		}

		for resource, df := range rawLimitRange.Default {
			rangeMap.getRange(resource).Default = df.String()
		}

		for resource, dfR := range rawLimitRange.DefaultRequest {
			rangeMap.getRange(resource).DefaultRequest = dfR.String()
		}

		for resource, mLR := range rawLimitRange.MaxLimitRequestRatio {
			rangeMap.getRange(resource).MaxLimitRequestRatio = mLR.String()
		}

		limitRanges[rawLimitRange.Type] = rangeMap
	}

	return limitRanges
}
