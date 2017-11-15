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

package replicaset

import (
	"github.com/kubernetes/dashboard/src/app/backend/api"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	apps "k8s.io/api/apps/v1beta2"
)

// ReplicaSet is a presentation layer view of Kubernetes Replica Set resource. This means
// it is Replica Set plus additional augmented data we can get from other sources
// (like services that target the same pods).
type ReplicaSet struct {
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
	TypeMeta   api.TypeMeta   `json:"typeMeta"`

	// Aggregate information about pods belonging to this Replica Set.
	Pods common.PodInfo `json:"pods"`

	// Container images of the Replica Set.
	ContainerImages []string `json:"containerImages"`

	// Init Container images of the Replica Set.
	InitContainerImages []string `json:"initContainerImages"`
}

// ToReplicaSet converts replica set api object to replica set model object.
func ToReplicaSet(replicaSet *apps.ReplicaSet, podInfo *common.PodInfo) ReplicaSet {
	return ReplicaSet{
		ObjectMeta:          api.NewObjectMeta(replicaSet.ObjectMeta),
		TypeMeta:            api.NewTypeMeta(api.ResourceKindReplicaSet),
		ContainerImages:     common.GetContainerImages(&replicaSet.Spec.Template.Spec),
		InitContainerImages: common.GetInitContainerImages(&replicaSet.Spec.Template.Spec),
		Pods:                *podInfo,
	}
}

// The code below allows to perform complex data section on Replica Set

type ReplicaSetCell apps.ReplicaSet

func (self ReplicaSetCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
	switch name {
	case dataselect.NameProperty:
		return dataselect.StdComparableString(self.ObjectMeta.Name)
	case dataselect.CreationTimestampProperty:
		return dataselect.StdComparableTime(self.ObjectMeta.CreationTimestamp.Time)
	case dataselect.NamespaceProperty:
		return dataselect.StdComparableString(self.ObjectMeta.Namespace)
	default:
		// if name is not supported then just return a constant dummy value, sort will have no effect.
		return nil
	}
}

func (self ReplicaSetCell) GetResourceSelector() *metricapi.ResourceSelector {
	return &metricapi.ResourceSelector{
		Namespace:    self.ObjectMeta.Namespace,
		ResourceType: api.ResourceKindReplicaSet,
		ResourceName: self.ObjectMeta.Name,
		UID:          self.UID,
	}
}

func ToCells(std []apps.ReplicaSet) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = ReplicaSetCell(std[i])
	}
	return cells
}

func FromCells(cells []dataselect.DataCell) []apps.ReplicaSet {
	std := make([]apps.ReplicaSet, len(cells))
	for i := range std {
		std[i] = apps.ReplicaSet(cells[i].(ReplicaSetCell))
	}
	return std
}
