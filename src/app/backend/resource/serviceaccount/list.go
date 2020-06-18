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

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	client "k8s.io/client-go/kubernetes"
)

// ServiceAccount contains an information about single service account in the list.
type ServiceAccount struct {
	api.ObjectMeta `json:"objectMeta"`
	api.TypeMeta   `json:"typeMeta"`
}

// ServiceAccountList contains a list of service accounts.
type ServiceAccountList struct {
	api.ListMeta `json:"listMeta"`
	Items        []ServiceAccount `json:"items"`
	Errors       []error          `json:"errors"`
}

// GetServiceAccountList lists service accounts from given namespace using given data select query.
func GetServiceAccountList(client client.Interface, namespace *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*ServiceAccountList, error) {
	saList, err := client.CoreV1().ServiceAccounts(namespace.ToRequestParam()).List(context.TODO(),
		api.ListEverything)

	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	return toServiceAccountList(saList.Items, nonCriticalErrors, dsQuery), nil
}

func toServiceAccount(sa *v1.ServiceAccount) ServiceAccount {
	return ServiceAccount{
		ObjectMeta: api.NewObjectMeta(sa.ObjectMeta),
		TypeMeta:   api.NewTypeMeta(api.ResourceKindServiceAccount),
	}
}

func toServiceAccountList(serviceAccounts []v1.ServiceAccount, nonCriticalErrors []error,
	dsQuery *dataselect.DataSelectQuery) *ServiceAccountList {
	newServiceAccountList := &ServiceAccountList{
		ListMeta: api.ListMeta{TotalItems: len(serviceAccounts)},
		Items:    make([]ServiceAccount, 0),
		Errors:   nonCriticalErrors,
	}

	saCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(serviceAccounts), dsQuery)
	serviceAccounts = fromCells(saCells)

	newServiceAccountList.ListMeta = api.ListMeta{TotalItems: filteredTotal}
	for _, sa := range serviceAccounts {
		newServiceAccountList.Items = append(newServiceAccountList.Items, toServiceAccount(&sa))
	}

	return newServiceAccountList
}
