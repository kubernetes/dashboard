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

package replicationcontroller

import (
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	"k8s.io/apimachinery/pkg/apis/meta/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/fields"
	"k8s.io/apimachinery/pkg/labels"
	client "k8s.io/client-go/kubernetes"
	api "k8s.io/client-go/pkg/api/v1"
)

// ReplicationController (aka. Replication Controller) plus zero or more Kubernetes services that
// target the Replication Controller.
type ReplicationController struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Aggregate information about pods belonging to this Replication Controller.
	Pods common.PodInfo `json:"pods"`

	// Container images of the Replication Controller.
	ContainerImages []string `json:"containerImages"`
}

// Transforms simple selector map to labels.Selector object that can be used when querying for
// object.
func toLabelSelector(selector map[string]string) (labels.Selector, error) {
	labelSelector, err := v1.LabelSelectorAsSelector(&v1.LabelSelector{MatchLabels: selector})

	if err != nil {
		return nil, err
	}

	return labelSelector, nil
}

// Based on given selector returns list of services that are candidates for deletion.
// Services are matched by replication controllers' label selector. They are deleted if given
// label selector is targeting only 1 replication controller.
func getServicesForDeletion(client client.Interface, labelSelector labels.Selector,
	namespace string) ([]api.Service, error) {

	replicationControllers, err := client.Core().ReplicationControllers(namespace).List(metaV1.ListOptions{
		LabelSelector: labelSelector.String(),
		FieldSelector: fields.Everything().String(),
	})
	if err != nil {
		return nil, err
	}

	// if label selector is targeting only 1 replication controller
	// then we can delete services targeted by this label selector,
	// otherwise we can not delete any services so just return empty list
	if len(replicationControllers.Items) != 1 {
		return []api.Service{}, nil
	}

	services, err := client.Core().Services(namespace).List(metaV1.ListOptions{
		LabelSelector: labelSelector.String(),
		FieldSelector: fields.Everything().String(),
	})
	if err != nil {
		return nil, err
	}

	return services.Items, nil
}

// ToReplicationController converts replication controller api object to replication controller
// model object.
func ToReplicationController(replicationController *api.ReplicationController,
	podInfo *common.PodInfo) ReplicationController {

	return ReplicationController{
		ObjectMeta:      common.NewObjectMeta(replicationController.ObjectMeta),
		TypeMeta:        common.NewTypeMeta(common.ResourceKindReplicationController),
		Pods:            *podInfo,
		ContainerImages: common.GetContainerImages(&replicationController.Spec.Template.Spec),
	}
}

// The code below allows to perform complex data section on []api.ReplicationController

type ReplicationControllerCell api.ReplicationController

func (self ReplicationControllerCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
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
func (self ReplicationControllerCell) GetResourceSelector() *metric.ResourceSelector {
	return &metric.ResourceSelector{
		Namespace:    self.ObjectMeta.Namespace,
		ResourceType: common.ResourceKindReplicationController,
		ResourceName: self.ObjectMeta.Name,
		UID:          self.UID,
	}
}

func toCells(std []api.ReplicationController) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = ReplicationControllerCell(std[i])
	}
	return cells
}

func fromCells(cells []dataselect.DataCell) []api.ReplicationController {
	std := make([]api.ReplicationController, len(cells))
	for i := range std {
		std[i] = api.ReplicationController(cells[i].(ReplicationControllerCell))
	}
	return std
}
