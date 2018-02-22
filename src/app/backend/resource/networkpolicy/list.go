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

package networkpolicy

import (
	"log"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	networking "k8s.io/api/networking/v1"
	"k8s.io/client-go/kubernetes"
)

// NetworkPolicyList is a representation of a kubernetes StorageClass object.
type NetworkPolicyList struct {
	ListMeta       api.ListMeta   `json:"listMeta"`
	NetworkPolicy []NetworkPolicy `json:"networkPolicy"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}


// GetNetworkPolicyList returns a list of all network policy in the cluster.
func GetNetworkPolicyList(client kubernetes.Interface,nsQuery *common.NamespaceQuery, dsQuery *dataselect.DataSelectQuery) (
	*NetworkPolicyList, error) {
	log.Print("Getting list of networkPolicy list in the cluster")

	channels := &common.ResourceChannels{
		NetworkPolicyList: common.GetNetworkPolicyListChannel(client,nsQuery, 1),
	}

	return GetNetworkPolicyListFromChannels(channels,nsQuery, dsQuery)
}

// GetNetworkPolicyListFromChannels returns a list of all networkpolicy class objects in the cluster.
func GetNetworkPolicyListFromChannels(channels *common.ResourceChannels,nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*NetworkPolicyList, error) {
	networkPolicyList := <-channels.NetworkPolicyList.List
	err := <-channels.NetworkPolicyList.Error
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}
	log.Println("networkPolicyList list page=",networkPolicyList)
	return toNetworkPolicyList(networkPolicyList.Items, nonCriticalErrors, dsQuery), nil
}

func toNetworkPolicyList(networkPolicys [] networking.NetworkPolicy,nonCriticalErrors []error,
	dsQuery *dataselect.DataSelectQuery) *NetworkPolicyList{
	networkPolicyList :=&NetworkPolicyList{
		NetworkPolicy:make([]NetworkPolicy,0),
		ListMeta:       api.ListMeta{TotalItems: len(networkPolicys)},
		Errors:         nonCriticalErrors,
	}

	networkPolicyCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(networkPolicys), dsQuery)
	networkPolicys = fromCells(networkPolicyCells)
	networkPolicyList.ListMeta = api.ListMeta{TotalItems: filteredTotal}

	for _, networkPolicy := range networkPolicys {
		networkPolicyList.NetworkPolicy = append(networkPolicyList.NetworkPolicy, toNetworkPolicy(&networkPolicy))
	}

	return networkPolicyList
}


func DeleteNetworkPolicy(client kubernetes.Interface,nsQuery *common.NamespaceQuery, name string)  error {
	err:=client.NetworkingV1().NetworkPolicies(nsQuery.ToRequestParam()).Delete(name,&metav1.DeleteOptions{})
	return err
}
