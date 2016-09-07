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

package release

import (
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	"k8s.io/helm/pkg/proto/hapi/release"
)

// The code below allows to perform complex data section on []extensions.Release

type ReleaseCell release.Release

func (self ReleaseCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
	switch name {
	case dataselect.NameProperty:
		return dataselect.StdComparableString(self.Name)
	case dataselect.NamespaceProperty:
		return dataselect.StdComparableString(self.Namespace)
	default:
		// if name is not supported then just return a constant dummy value, sort will have no effect.
		return nil
	}
}

func (self ReleaseCell) GetResourceSelector() *metric.ResourceSelector {
	return &metric.ResourceSelector{
		Namespace:    self.Namespace,
		ResourceType: common.ResourceKindRelease,
		ResourceName: self.Name,
		Selector:     nil, // TODO: Release
	}
}

func toCells(std []release.Release) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = ReleaseCell(std[i])
	}
	return cells
}

func fromCells(cells []dataselect.DataCell) []release.Release {
	std := make([]release.Release, len(cells))
	for i := range std {
		std[i] = release.Release(cells[i].(ReleaseCell))
	}
	return std
}
