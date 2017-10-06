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

package discovery

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/ingress"
	"github.com/kubernetes/dashboard/src/app/backend/resource/service"
	"k8s.io/client-go/kubernetes"
)

// Discovery structure contains all resource lists grouped into the servicesAndDiscovery category.
type Discovery struct {
	ServiceList service.ServiceList `json:"serviceList"`
	IngressList ingress.IngressList `json:"ingressList"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// GetDiscovery returns a list of all servicesAndDiscovery resources in the cluster.
func GetDiscovery(client kubernetes.Interface, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*Discovery, error) {

	log.Print("Getting discovery and load balancing category")
	channels := &common.ResourceChannels{
		ServiceList: common.GetServiceListChannel(client, nsQuery, 1),
		IngressList: common.GetIngressListChannel(client, nsQuery, 1),
	}

	return GetDiscoveryFromChannels(channels, dsQuery)
}

// GetDiscoveryFromChannels returns a list of all servicesAndDiscovery in the cluster, from the
// channel sources.
func GetDiscoveryFromChannels(channels *common.ResourceChannels,
	dsQuery *dataselect.DataSelectQuery) (*Discovery, error) {

	numErrs := 2
	errChan := make(chan error, numErrs)
	svcChan := make(chan *service.ServiceList)
	ingressChan := make(chan *ingress.IngressList)

	go func() {
		items, err := service.GetServiceListFromChannels(channels, dsQuery)
		errChan <- err
		svcChan <- items
	}()

	go func() {
		items, err := ingress.GetIngressListFromChannels(channels, dsQuery)
		errChan <- err
		ingressChan <- items
	}()

	for i := 0; i < numErrs; i++ {
		err := <-errChan
		if err != nil {
			return nil, err
		}
	}

	discovery := &Discovery{
		ServiceList: *(<-svcChan),
		IngressList: *(<-ingressChan),
	}

	discovery.Errors = errors.MergeErrors(discovery.ServiceList.Errors, discovery.IngressList.Errors)

	return discovery, nil
}
