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

package service

import (
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/ingress"
	client "k8s.io/client-go/kubernetes"
)

func GetServiceIngressList(client client.Interface, dsQuery *dataselect.DataSelectQuery,
	namespace, serviceName string) (*ingress.IngressList, error) {

	channels := &common.ResourceChannels{
		IngressList: common.GetIngressListChannel(client, common.NewSameNamespaceQuery(namespace), 1),
	}

	ingressList := <-channels.IngressList.List
	err := <-channels.IngressList.Error
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	matchingIngressList := ingress.FilterIngressByService(ingressList.Items, serviceName)
	return ingress.ToIngressList(matchingIngressList, nonCriticalErrors, dsQuery), nil
}
