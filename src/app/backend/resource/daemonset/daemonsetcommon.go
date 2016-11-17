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

package daemonset

import (
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/apis/extensions"
	client "k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
)

// Based on given selector returns list of services that are candidates for deletion.
// Services are matched by daemon sets' label selector. They are deleted if given
// label selector is targeting only 1 daemon set.
func GetServicesForDSDeletion(client client.Interface, labelSelector labels.Selector,
	namespace string) ([]api.Service, error) {

	daemonSet, err := client.Extensions().DaemonSets(namespace).List(api.ListOptions{
		LabelSelector: labelSelector,
		FieldSelector: fields.Everything(),
	})
	if err != nil {
		return nil, err
	}

	// if label selector is targeting only 1 daemon set
	// then we can delete services targeted by this label selector,
	// otherwise we can not delete any services so just return empty list
	if len(daemonSet.Items) != 1 {
		return []api.Service{}, nil
	}

	services, err := client.Core().Services(namespace).List(api.ListOptions{
		LabelSelector: labelSelector,
		FieldSelector: fields.Everything(),
	})
	if err != nil {
		return nil, err
	}

	return services.Items, nil
}

// The code below allows to perform complex data section on []extensions.DaemonSet

type DaemonSetCell extensions.DaemonSet

func (self DaemonSetCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
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

func (self DaemonSetCell) GetResourceSelector() *metric.ResourceSelector {
	return &metric.ResourceSelector{
		Namespace:     self.ObjectMeta.Namespace,
		ResourceType:  common.ResourceKindDaemonSet,
		ResourceName:  self.ObjectMeta.Name,
		LabelSelector: self.Spec.Selector,
	}
}

func ToCells(std []extensions.DaemonSet) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = DaemonSetCell(std[i])
	}
	return cells
}

func FromCells(cells []dataselect.DataCell) []extensions.DaemonSet {
	std := make([]extensions.DaemonSet, len(cells))
	for i := range std {
		std[i] = extensions.DaemonSet(cells[i].(DaemonSetCell))
	}
	return std
}
