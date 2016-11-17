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

package ingress

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/apis/extensions"
	client "k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset"
)

// IngressDetail API resource provides mechanisms to inject containers with configuration data while keeping
// containers agnostic of Kubernetes
type IngressDetail struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// TODO(bryk): replace this with UI specific fields.
	// Spec is the desired state of the Ingress.
	Spec extensions.IngressSpec `json:"spec"`

	// Status is the current state of the Ingress.
	Status extensions.IngressStatus `json:"status"`
}

// GetIngressDetail returns returns detailed information about a ingress
func GetIngressDetail(client client.Interface, namespace, name string) (*IngressDetail, error) {
	log.Printf("Getting details of %s ingress in %s namespace", name, namespace)

	rawIngress, err := client.Extensions().Ingresses(namespace).Get(name)

	if err != nil {
		return nil, err
	}

	return getIngressDetail(rawIngress), nil
}

func getIngressDetail(rawIngress *extensions.Ingress) *IngressDetail {
	return &IngressDetail{
		ObjectMeta: common.NewObjectMeta(rawIngress.ObjectMeta),
		TypeMeta:   common.NewTypeMeta(common.ResourceKindIngress),
		Spec:       rawIngress.Spec,
		Status:     rawIngress.Status,
	}
}
