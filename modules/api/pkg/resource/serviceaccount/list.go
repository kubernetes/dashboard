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

package serviceaccount

import (
	"context"

	v1 "k8s.io/api/core/v1"

	client "k8s.io/client-go/kubernetes"

	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/errors"
	"k8s.io/dashboard/helpers"
	"k8s.io/dashboard/types"
)

// ServiceAccount contains an information about single service account in the list.
type ServiceAccount struct {
	types.ObjectMeta `json:"objectMeta"`
	types.TypeMeta   `json:"typeMeta"`
}

// ServiceAccountList contains a list of service accounts.
type ServiceAccountList struct {
	types.ListMeta `json:"listMeta"`
	Items          []ServiceAccount `json:"items"`
	Errors         []error          `json:"errors"`
}

// GetServiceAccountList lists service accounts from given namespace using given data select query.
func GetServiceAccountList(client client.Interface, namespace *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*ServiceAccountList, error) {
	saList, err := client.CoreV1().ServiceAccounts(namespace.ToRequestParam()).List(context.TODO(),
		helpers.ListEverything)

	nonCriticalErrors, criticalError := errors.ExtractErrors(err)
	if criticalError != nil {
		return nil, criticalError
	}

	return toServiceAccountList(saList.Items, nonCriticalErrors, dsQuery), nil
}

func toServiceAccount(sa *v1.ServiceAccount) ServiceAccount {
	return ServiceAccount{
		ObjectMeta: types.NewObjectMeta(sa.ObjectMeta),
		TypeMeta:   types.NewTypeMeta(types.ResourceKindServiceAccount),
	}
}

func toServiceAccountList(serviceAccounts []v1.ServiceAccount, nonCriticalErrors []error,
	dsQuery *dataselect.DataSelectQuery) *ServiceAccountList {
	newServiceAccountList := &ServiceAccountList{
		ListMeta: types.ListMeta{TotalItems: len(serviceAccounts)},
		Items:    make([]ServiceAccount, 0),
		Errors:   nonCriticalErrors,
	}

	saCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(serviceAccounts), dsQuery)
	serviceAccounts = fromCells(saCells)

	newServiceAccountList.ListMeta = types.ListMeta{TotalItems: filteredTotal}
	for _, sa := range serviceAccounts {
		newServiceAccountList.Items = append(newServiceAccountList.Items, toServiceAccount(&sa))
	}

	return newServiceAccountList
}
