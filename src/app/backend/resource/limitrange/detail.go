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

package limitrange

import api "k8s.io/api/core/v1"

// limitRanges provides set of limit ranges by limit types and resource names
type limitRangesMap map[api.LimitType]rangeMap

// rangeMap provides limit ranges by resource name
type rangeMap map[api.ResourceName]*LimitRangeItem

func (rMap rangeMap) getRange(resource api.ResourceName) *LimitRangeItem {
	r, ok := rMap[resource]
	if !ok {
		rMap[resource] = &LimitRangeItem{}
		return rMap[resource]
	} else {
		return r
	}
}

// LimitRange provides resource limit range values
type LimitRangeItem struct {
	// ResourceName usage constraints on this kind by resource name
	ResourceName string `json:"resourceName,omitempty"`
	// ResourceType of resource that this limit applies to
	ResourceType string `json:"resourceType,omitempty"`
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

// toLimitRanges converts raw limit ranges to limit ranges map
func toLimitRangesMap(rawLimitRange *api.LimitRange) limitRangesMap {

	rawLimitRanges := rawLimitRange.Spec.Limits

	limitRanges := make(limitRangesMap, len(rawLimitRanges))

	for _, rawLimitRange := range rawLimitRanges {

		rangeMap := make(rangeMap)

		for resource, min := range rawLimitRange.Min {
			rangeMap.getRange(resource).Min = min.String()
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

func ToLimitRanges(rawLimitRange *api.LimitRange) []LimitRangeItem {
	limitRangeMap := toLimitRangesMap(rawLimitRange)
	limitRangeList := make([]LimitRangeItem, 0)
	for limitType, rangeMap := range limitRangeMap {
		for resourceName, limit := range rangeMap {
			limit.ResourceName = resourceName.String()
			limit.ResourceType = string(limitType)
			limitRangeList = append(limitRangeList, *limit)
		}
	}
	return limitRangeList
}
