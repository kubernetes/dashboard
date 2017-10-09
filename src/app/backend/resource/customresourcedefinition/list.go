// Copyright 2017 The Kubernetes Dashboard Authors.
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

package customresourcedefinition

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1beta1"
	apiextensionsclient "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"
)

type CustomResourceDefinition struct {
	TypeMeta   api.TypeMeta   `json:"typeMeta"`
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
}

type CustomResourceDefinitionList struct {
	TypeMeta api.TypeMeta `json:"typeMeta"`
	ListMeta api.ListMeta `json:"listMeta"`

	// Items individual CustomResourceDefinitions
	Items []CustomResourceDefinition `json:"customResourceDefinitions"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// The code below allows to perform complex data section on []extensions.CustomResourceDefinition.
type CustomResourceDefinitionCell v1beta1.CustomResourceDefinition

func (self CustomResourceDefinitionCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
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

// GetCustomResourceDefinitionList returns a list of third party resource templates.
func GetCustomResourceDefinitionList(client apiextensionsclient.Interface, dsQuery *dataselect.DataSelectQuery) (*CustomResourceDefinitionList, error) {
	log.Println("Getting list of third party resources")

	channels := &common.ResourceChannels{
		CustomResourceDefinitionList: common.GetCustomResourceDefinitionListChannel(client, 1),
	}

	return GetCustomResourceDefinitionListFromChannels(channels, dsQuery)
}

// GetCustomResourceDefinitionListFromChannels returns a list of all third party resources in the cluster
// reading required resource list once from the channels.
func GetCustomResourceDefinitionListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery) (*CustomResourceDefinitionList, error) {
	tprs := <-channels.CustomResourceDefinitionList.List
	err := <-channels.CustomResourceDefinitionList.Error
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	result := getCustomResourceDefinitionList(tprs.Items, nonCriticalErrors, dsQuery)
	return result, nil
}

func getCustomResourceDefinitionList(customResourceDefinitions []v1beta1.CustomResourceDefinition, nonCriticalErrors []error,
	dsQuery *dataselect.DataSelectQuery) *CustomResourceDefinitionList {

	result := &CustomResourceDefinitionList{
		Items:    make([]CustomResourceDefinition, 0),
		ListMeta: api.ListMeta{TotalItems: len(customResourceDefinitions)},
		Errors:   nonCriticalErrors,
	}

	tprCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(customResourceDefinitions), dsQuery)
	customResourceDefinitions = fromCells(tprCells)
	result.ListMeta = api.ListMeta{TotalItems: filteredTotal}

	for _, item := range customResourceDefinitions {
		result.Items = append(result.Items,
			CustomResourceDefinition{
				ObjectMeta: api.NewObjectMeta(item.ObjectMeta),
				TypeMeta:   api.NewTypeMeta(api.ResourceKindCustomResourceDefinition),
			})
	}

	return result
}

type CustomResourceDefinitionObjectCell v1beta1.CustomResourceDefinition

func (self CustomResourceDefinitionObjectCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
	switch name {
	case dataselect.NameProperty:
		return dataselect.StdComparableString(self.Name)
	case dataselect.CreationTimestampProperty:
		return dataselect.StdComparableTime(self.CreationTimestamp.Time)
	case dataselect.NamespaceProperty:
		return dataselect.StdComparableString(self.Namespace)
	default:
		// if name is not supported then just return a constant dummy value, sort will have no effect.
		return nil
	}
}

func toCells(std []v1beta1.CustomResourceDefinition) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = CustomResourceDefinitionObjectCell(std[i])
	}
	return cells
}

func fromCells(cells []dataselect.DataCell) []v1beta1.CustomResourceDefinition {
	std := make([]v1beta1.CustomResourceDefinition, len(cells))
	for i := range std {
		std[i] = v1beta1.CustomResourceDefinition(cells[i].(CustomResourceDefinitionObjectCell))
	}
	return std
}

// The code below allows to perform complex data section on ThirdPartyResourceObject.
type CustomResourceDefinitionObjCell CustomResourceDefinitionObj

func (self CustomResourceDefinitionObjCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
	switch name {
	case dataselect.NameProperty:
		return dataselect.StdComparableString(self.Metadata.Name)
	case dataselect.CreationTimestampProperty:
		return dataselect.StdComparableTime(self.Metadata.CreationTimestamp.Time)
	case dataselect.NamespaceProperty:
		return dataselect.StdComparableString(self.Metadata.Namespace)
	default:
		// if name is not supported then just return a constant dummy value, sort will have no effect.
		return nil
	}
}
func toObjectCells(std []CustomResourceDefinitionObj) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = CustomResourceDefinitionObjCell(std[i])
	}
	return cells
}

func fromObjectCells(cells []dataselect.DataCell) []CustomResourceDefinitionObj {
	std := make([]CustomResourceDefinitionObj, len(cells))
	for i := range std {
		std[i] = CustomResourceDefinitionObj(cells[i].(CustomResourceDefinitionObjCell))
	}
	return std
}
