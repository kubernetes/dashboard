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
	policyv1 "k8s.io/api/policy/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
	"k8s.io/client-go/kubernetes"

	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/errors"
	"k8s.io/dashboard/types"
)

type PodDisruptionBudgetList struct {
	ListMeta types.ListMeta        `json:"listMeta"`
	Items    []PodDisruptionBudget `json:"items"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

type PodDisruptionBudget struct {
	ObjectMeta types.ObjectMeta `json:"objectMeta"`
	TypeMeta   types.TypeMeta   `json:"typeMeta"`

	// MinAvailable is the minimum number or percentage of available pods this budget requires.
	MinAvailable *intstr.IntOrString `json:"minAvailable"`

	// MaxUnavailable is the maximum number or percentage of unavailable pods this budget requires.
	MaxUnavailable *intstr.IntOrString `json:"maxUnavailable"`

	// UnhealthyPodEvictionPolicy defines the criteria for when unhealthy pods should be considered for eviction.
	UnhealthyPodEvictionPolicy *policyv1.UnhealthyPodEvictionPolicyType `json:"unhealthyPodEvictionPolicy"`

	// LabelSelector is the label query over pods whose evictions are managed by the disruption budget.
	LabelSelector *metaV1.LabelSelector `json:"labelSelector,omitempty"`

	// CurrentHealthy is the current number of healthy pods.
	CurrentHealthy int32 `json:"currentHealthy"`

	// DesiredHealthy is the minimum desired number of healthy pods.
	DesiredHealthy int32 `json:"desiredHealthy"`

	// DisruptionsAllowed is the number of pod disruptions that are currently allowed.
	DisruptionsAllowed int32 `json:"disruptionsAllowed"`

	// ExpectedPods is the total number of pods counted by this disruption budget.
	ExpectedPods int32 `json:"expectedPods"`
}

func List(client kubernetes.Interface, nsQuery *common.NamespaceQuery, dsQuery *dataselect.DataSelectQuery) (*PodDisruptionBudgetList, error) {
	channels := &common.ResourceChannels{
		PodDisruptionBudget: common.GetPodDisruptionBudgetListChannel(client, nsQuery, 1),
	}

	return getListFromChannels(channels, dsQuery)
}

func getListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery) (*PodDisruptionBudgetList, error) {
	list := <-channels.PodDisruptionBudget.List
	err := <-channels.PodDisruptionBudget.Error
	nonCriticalErrors, criticalError := errors.ExtractErrors(err)
	if criticalError != nil {
		return nil, criticalError
	}

	return toList(list.Items, nonCriticalErrors, dsQuery), nil
}

func toList(podDisruptionBudgets []policyv1.PodDisruptionBudget, nonCriticalErrors []error,
	dsQuery *dataselect.DataSelectQuery) *PodDisruptionBudgetList {

	result := &PodDisruptionBudgetList{
		Items:    make([]PodDisruptionBudget, 0),
		ListMeta: types.ListMeta{TotalItems: len(podDisruptionBudgets)},
		Errors:   nonCriticalErrors,
	}

	cells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(podDisruptionBudgets), dsQuery)
	podDisruptionBudgets = fromCells(cells)
	result.ListMeta = types.ListMeta{TotalItems: filteredTotal}

	for _, item := range podDisruptionBudgets {
		result.Items = append(result.Items, toListItem(item))
	}

	return result
}

func toListItem(pdb policyv1.PodDisruptionBudget) PodDisruptionBudget {
	return PodDisruptionBudget{
		ObjectMeta:                 types.NewObjectMeta(pdb.ObjectMeta),
		TypeMeta:                   types.NewTypeMeta(types.ResourceKindPodDisruptionBudget),
		MinAvailable:               pdb.Spec.MinAvailable,
		MaxUnavailable:             pdb.Spec.MaxUnavailable,
		UnhealthyPodEvictionPolicy: pdb.Spec.UnhealthyPodEvictionPolicy,
		LabelSelector:              pdb.Spec.Selector,
		CurrentHealthy:             pdb.Status.CurrentHealthy,
		DesiredHealthy:             pdb.Status.DesiredHealthy,
		DisruptionsAllowed:         pdb.Status.DisruptionsAllowed,
		ExpectedPods:               pdb.Status.ExpectedPods,
	}
}
