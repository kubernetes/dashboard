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
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/apis/extensions"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
)

// Based on given selector returns list of services that are candidates for deletion.
// Services are matched by daemon sets' label selector. They are deleted if given
// label selector is targeting only 1 daemon set.
func getServicesForDSDeletion(client client.Interface, labelSelector labels.Selector,
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

	services, err := client.Services(namespace).List(api.ListOptions{
		LabelSelector: labelSelector,
		FieldSelector: fields.Everything(),
	})
	if err != nil {
		return nil, err
	}

	return services.Items, nil
}

// The code below allows to perform complex data section on []extensions.DaemonSet

var propertyGetters = map[string]func(DaemonSetCell)(common.ComparableValue){
	"name": func(self DaemonSetCell)(common.ComparableValue) {return common.StdComparableString(self.ObjectMeta.Name)},
	"creationTimestamp": func(self DaemonSetCell)(common.ComparableValue) {return common.StdComparableTime(self.ObjectMeta.CreationTimestamp.Time)},
	"namespace": func(self DaemonSetCell)(common.ComparableValue) {return common.StdComparableString(self.ObjectMeta.Namespace)},
}


type DaemonSetCell extensions.DaemonSet

func (self DaemonSetCell) GetProperty(name common.PropertyName) common.ComparableValue {
	switch name {
	case common.NameProperty:
		return common.StdComparableString(self.ObjectMeta.Name)
	case common.CreationTimestampProperty:
		return common.StdComparableTime(self.ObjectMeta.CreationTimestamp.Time)
	case common.NamespaceProperty:
		return common.StdComparableString(self.ObjectMeta.Namespace)
	default:
		// if name is not supported then just return a constant dummy value, sort will have no effect.
		return nil
	}
}


func toCells(std []extensions.DaemonSet) []common.GenericDataCell {
	cells := make([]common.GenericDataCell, len(std))
	for i := range std {
		cells[i] = DaemonSetCell(std[i])
	}
	return cells
}

func fromCells(cells []common.GenericDataCell) []extensions.DaemonSet {
	std := make([]extensions.DaemonSet, len(cells))
	for i := range std {
		std[i] = extensions.DaemonSet(cells[i].(DaemonSetCell))
	}
	return std
}

