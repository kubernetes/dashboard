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

package replicaset

import (
	"context"
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/errors"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	hpa "github.com/kubernetes/dashboard/src/app/backend/resource/horizontalpodautoscaler"
	apps "k8s.io/api/apps/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sClient "k8s.io/client-go/kubernetes"
)

// ReplicaSetDetail is a presentation layer view of Kubernetes Replica Set resource. This means
// it is Replica Set plus additional augmented data we can get from other sources
// (like services that target the same pods).
type ReplicaSetDetail struct {
	// Extends list item structure.
	ReplicaSet `json:",inline"`

	// Selector of this replica set.
	Selector *metaV1.LabelSelector `json:"selector"`

	// List of Horizontal Pod Autoscalers targeting this Replica Set.
	HorizontalPodAutoscalerList hpa.HorizontalPodAutoscalerList `json:"horizontalPodAutoscalerList"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// GetReplicaSetDetail gets replica set details.
func GetReplicaSetDetail(client k8sClient.Interface, metricClient metricapi.MetricClient,
	namespace, name string) (*ReplicaSetDetail, error) {
	log.Printf("Getting details of %s service in %s namespace", name, namespace)

	rs, err := client.AppsV1().ReplicaSets(namespace).Get(context.TODO(), name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	podInfo, err := getReplicaSetPodInfo(client, rs)
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	hpas, err := hpa.GetHorizontalPodAutoscalerListForResource(client, namespace, "ReplicaSet", name)
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	rsDetail := toReplicaSetDetail(rs, *podInfo, *hpas, nonCriticalErrors)
	return &rsDetail, nil
}

func toReplicaSetDetail(rs *apps.ReplicaSet, podInfo common.PodInfo, hpas hpa.HorizontalPodAutoscalerList, nonCriticalErrors []error) ReplicaSetDetail {
	return ReplicaSetDetail{
		ReplicaSet:                  ToReplicaSet(rs, &podInfo),
		Selector:                    rs.Spec.Selector,
		HorizontalPodAutoscalerList: hpas,
		Errors:                      nonCriticalErrors,
	}
}
