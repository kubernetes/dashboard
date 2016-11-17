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

package servicesanddiscovery

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/ingress"
	"github.com/kubernetes/dashboard/src/app/backend/resource/service"
	k8sClient "k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset"
)

// ServicesAndDiscovery structure contains all resource lists grouped into the servicesAndDiscovery category.
type ServicesAndDiscovery struct {
	ServiceList service.ServiceList `json:"serviceList"`

	IngressList ingress.IngressList `json:"ingressList"`
}

// GetServicesAndDiscovery returns a list of all servicesAndDiscovery resources in the cluster.
func GetServicesAndDiscovery(client *k8sClient.Clientset, nsQuery *common.NamespaceQuery) (
	*ServicesAndDiscovery, error) {

	log.Print("Getting servicesAndDiscovery category")
	channels := &common.ResourceChannels{
		ServiceList: common.GetServiceListChannel(client, nsQuery, 1),
		IngressList: common.GetIngressListChannel(client, nsQuery, 1),
	}

	return GetServicesAndDiscoveryFromChannels(channels)
}

// GetServicesAndDiscoveryFromChannels returns a list of all servicesAndDiscovery in the cluster, from the
// channel sources.
func GetServicesAndDiscoveryFromChannels(channels *common.ResourceChannels) (
	*ServicesAndDiscovery, error) {

	svcChan := make(chan *service.ServiceList)
	ingressChan := make(chan *ingress.IngressList)
	numErrs := 2
	errChan := make(chan error, numErrs)

	go func() {
		items, err := service.GetServiceListFromChannels(channels,
			dataselect.DefaultDataSelect)
		errChan <- err
		svcChan <- items
	}()

	go func() {
		items, err := ingress.GetIngressListFromChannels(channels, dataselect.DefaultDataSelect)
		errChan <- err
		ingressChan <- items
	}()

	for i := 0; i < numErrs; i++ {
		err := <-errChan
		if err != nil {
			return nil, err
		}
	}

	servicesAndDiscovery := &ServicesAndDiscovery{
		ServiceList: *(<-svcChan),
		IngressList: *(<-ingressChan),
	}

	return servicesAndDiscovery, nil
}
