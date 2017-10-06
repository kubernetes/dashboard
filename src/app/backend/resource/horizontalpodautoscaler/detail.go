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

package horizontalpodautoscaler

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	autoscaling "k8s.io/api/autoscaling/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1"
	client "k8s.io/client-go/kubernetes"
)

// HorizontalPodAutoscalerDetail provides the presentation layer view of Kubernetes Horizontal Pod Autoscaler resource.
// close mapping of the autoscaling.HorizontalPodAutoscaler type with part of the *Spec and *Detail childs
type HorizontalPodAutoscalerDetail struct {
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
	TypeMeta   api.TypeMeta   `json:"typeMeta"`

	ScaleTargetRef ScaleTargetRef `json:"scaleTargetRef"`

	MinReplicas *int32 `json:"minReplicas"`
	MaxReplicas int32  `json:"maxReplicas"`

	CurrentCPUUtilizationPercentage *int32 `json:"currentCPUUtilizationPercentage"`
	TargetCPUUtilizationPercentage  *int32 `json:"targetCPUUtilizationPercentage"`

	CurrentReplicas int32 `json:"currentReplicas"`
	DesiredReplicas int32 `json:"desiredReplicas"`

	LastScaleTime *v1.Time `json:"lastScaleTime"`
}

// GetHorizontalPodAutoscalerDetail returns detailed information about a horizontal pod autoscaler
func GetHorizontalPodAutoscalerDetail(client client.Interface, namespace string, name string) (*HorizontalPodAutoscalerDetail, error) {
	log.Printf("Getting details of %s horizontal pod autoscaler", name)

	rawHorizontalPodAutoscaler, err := client.AutoscalingV1().HorizontalPodAutoscalers(namespace).Get(name, v1.GetOptions{})

	if err != nil {
		return nil, err
	}

	return getHorizontalPodAutoscalerDetail(rawHorizontalPodAutoscaler), nil
}

func getHorizontalPodAutoscalerDetail(horizontalPodAutoscaler *autoscaling.HorizontalPodAutoscaler) *HorizontalPodAutoscalerDetail {

	return &HorizontalPodAutoscalerDetail{
		ObjectMeta: api.NewObjectMeta(horizontalPodAutoscaler.ObjectMeta),
		TypeMeta:   api.NewTypeMeta(api.ResourceKindHorizontalPodAutoscaler),

		ScaleTargetRef: ScaleTargetRef{
			Kind: horizontalPodAutoscaler.Spec.ScaleTargetRef.Kind,
			Name: horizontalPodAutoscaler.Spec.ScaleTargetRef.Name,
		},

		MinReplicas:                     horizontalPodAutoscaler.Spec.MinReplicas,
		MaxReplicas:                     horizontalPodAutoscaler.Spec.MaxReplicas,
		CurrentCPUUtilizationPercentage: horizontalPodAutoscaler.Status.CurrentCPUUtilizationPercentage,
		TargetCPUUtilizationPercentage:  horizontalPodAutoscaler.Spec.TargetCPUUtilizationPercentage,

		CurrentReplicas: horizontalPodAutoscaler.Status.CurrentReplicas,
		DesiredReplicas: horizontalPodAutoscaler.Status.DesiredReplicas,

		LastScaleTime: horizontalPodAutoscaler.Status.LastScaleTime,
	}
}
