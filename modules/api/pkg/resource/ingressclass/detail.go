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

package ingressclass

import (
	"context"
	"log"

	networkingv1 "k8s.io/api/networking/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

// IngressClassDetail provides the presentation layer view of Ingress Class resource.
type IngressClassDetail struct {
	// Extends list item structure.
	IngressClass `json:",inline"`
	Parameters   map[string]string `json:"parameters"`
}

// GetIngressClass returns Storage Class resource.
func GetIngressClass(client kubernetes.Interface, name string) (*IngressClassDetail, error) {
	log.Printf("Getting details of %s ingress class", name)

	ic, err := client.NetworkingV1().IngressClasses().Get(context.TODO(), name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	ingressClass := toIngressClassDetail(ic)
	return &ingressClass, err
}

func toIngressClassDetail(ingressClass *networkingv1.IngressClass) IngressClassDetail {
	parametersMap := make(map[string]string)
	parameters := ingressClass.Spec.Parameters
	if parameters != nil {
		// Mandatory parameters
		parametersMap["Kind"] = parameters.Kind
		parametersMap["Name"] = parameters.Name
		// Optional parameters
		if parameters.APIGroup != nil {
			parametersMap["ApiGroup"] = *parameters.APIGroup
		}
		if parameters.Namespace != nil {
			parametersMap["Namespace"] = *parameters.Namespace
		}
		if parameters.Scope != nil {
			parametersMap["Scope"] = *parameters.Scope
		}
	}
	return IngressClassDetail{
		IngressClass: toIngressClass(ingressClass),
		Parameters:   parametersMap,
	}
}
