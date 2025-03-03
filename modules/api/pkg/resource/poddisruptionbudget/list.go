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

package poddisruptionbudget

import (
	v1 "k8s.io/api/core/v1"
	policyv1 "k8s.io/api/policy/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
	"k8s.io/client-go/kubernetes"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/errors"
	"k8s.io/dashboard/types"
)

// PodDisruptionBudgetList contains a list of Pod Disruption Budgets.
type PodDisruptionBudgetList struct {
	ListMeta types.ListMeta `json:"listMeta"`

	Items []PodDisruptionBudget `json:"items"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// PodDisruptionBudget provides the simplified presentation layer view of Pod Disruption Budget resource.
type PodDisruptionBudget struct {
	ObjectMeta types.ObjectMeta `json:"objectMeta"`
	TypeMeta   types.TypeMeta   `json:"typeMeta"`
	Status     string           `json:"status"`

	MinAvailable   *intstr.IntOrString `json:"minAvailable"`
	MaxUnavailable *intstr.IntOrString `json:"maxUnavailable"`

	// UnhealthyPodEvictionPolicy defines the criteria for when unhealthy pods should be considered for eviction.
	UnhealthyPodEvictionPolicy *policyv1.UnhealthyPodEvictionPolicyType `json:"unhealthyPodEvictionPolicy"`

	// LabelSelector is a label query over pods whose evictions are managed by the disruption budget.
	LabelSelector *metaV1.LabelSelector `json:"labelSelector,omitempty"`
}

// GetPersistentVolumeClaimList returns a list of all Persistent Volume Claims in the cluster.
func GetPersistentVolumeClaimList(client kubernetes.Interface, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*PodDisruptionBudgetList, error) {

	klog.V(4).Infof("Getting list persistent volumes claims")
	channels := &common.ResourceChannels{
		PersistentVolumeClaimList: common.GetPersistentVolumeClaimListChannel(client, nsQuery, 1),
	}

	return GetPersistentVolumeClaimListFromChannels(channels, nsQuery, dsQuery)
}

// GetPersistentVolumeClaimListFromChannels returns a list of all Persistent Volume Claims in the cluster
// reading required resource list once from the channels.
func GetPersistentVolumeClaimListFromChannels(channels *common.ResourceChannels, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*PodDisruptionBudgetList, error) {

	persistentVolumeClaims := <-channels.PersistentVolumeClaimList.List
	err := <-channels.PersistentVolumeClaimList.Error
	nonCriticalErrors, criticalError := errors.ExtractErrors(err)
	if criticalError != nil {
		return nil, criticalError
	}

	return toPersistentVolumeClaimList(persistentVolumeClaims.Items, nonCriticalErrors, dsQuery), nil
}

func toPodDisruptionBudget(pdb policyv1.PodDisruptionBudget) PodDisruptionBudget {
	return PodDisruptionBudget{
		ObjectMeta:                 types.NewObjectMeta(pdb.ObjectMeta),
		TypeMeta:                   types.NewTypeMeta(types.ResourceKindPersistentVolumeClaim),
		MinAvailable:               pdb.Spec.MinAvailable,
		MaxUnavailable:             pdb.Spec.MaxUnavailable,
		UnhealthyPodEvictionPolicy: pdb.Spec.UnhealthyPodEvictionPolicy,
		LabelSelector:              pdb.Spec.Selector,
	}
}

func toPersistentVolumeClaimList(podDisruptionBudgets []policyv1.PodDisruptionBudget, nonCriticalErrors []error,
	dsQuery *dataselect.DataSelectQuery) *PodDisruptionBudgetList {

	result := &PodDisruptionBudgetList{
		Items:    make([]PodDisruptionBudget, 0),
		ListMeta: types.ListMeta{TotalItems: len(podDisruptionBudgets)},
		Errors:   nonCriticalErrors,
	}

	pvcCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(podDisruptionBudgets), dsQuery)
	podDisruptionBudgets = fromCells(pvcCells)
	result.ListMeta = types.ListMeta{TotalItems: filteredTotal}

	for _, item := range podDisruptionBudgets {
		result.Items = append(result.Items, toPodDisruptionBudget(item))
	}

	return result
}
