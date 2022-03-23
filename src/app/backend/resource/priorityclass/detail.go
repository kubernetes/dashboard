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

package priorityclass

import (
	"context"

	api "k8s.io/api/core/v1"
	scheduling "k8s.io/api/scheduling/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sClient "k8s.io/client-go/kubernetes"
)

// PriorityClassDetail
type PriorityClassDetail struct {
	PriorityClass `json:",inline"`

	Value int32 `json:"value"`

	GlobalDefault bool `json:"globalDefault,omitempty" protobuf:"bytes,3,opt,name=globalDefault"`

	Description string `json:"description,omitempty" protobuf:"bytes,4,opt,name=description"`

	PreemptionPolicy api.PreemptionPolicy `json:"preemptionPolicy"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// GetPriorityClassDetail gets Priority Class details.
func GetPriorityClassDetail(client k8sClient.Interface, name string) (*PriorityClassDetail, error) {
	rawObject, err := client.SchedulingV1().PriorityClasses().Get(context.TODO(), name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	pc := toPriorityClassDetail(*rawObject)
	return &pc, nil
}

func toPriorityClassDetail(pc scheduling.PriorityClass) PriorityClassDetail {
	return PriorityClassDetail{
		PriorityClass:    toPriorityClass(pc),
		PreemptionPolicy: *pc.PreemptionPolicy,
		Value:            *&pc.Value,
		GlobalDefault:    *&pc.GlobalDefault,
		Description:      *&pc.Description,
		Errors:           []error{},
	}
}
