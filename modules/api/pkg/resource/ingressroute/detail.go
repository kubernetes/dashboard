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

package ingressroute

import (
	"context"
	"log"

	traefik "github.com/traefik/traefik/v3/pkg/provider/kubernetes/crd/generated/clientset/versioned"
	traefikv1 "github.com/traefik/traefik/v3/pkg/provider/kubernetes/crd/traefikio/v1alpha1"

	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	client "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

// IngressDetail API resource provides mechanisms to inject containers with configuration data while keeping
// containers agnostic of Kubernetes
type IngressRouteDetail struct {
	// Extends list item structure.
	IngressRoute `json:",inline"`

	// Spec is the desired state of the Ingress.
	Spec traefikv1.IngressRouteSpec `json:"spec"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}


// GetIngressDetail returns detailed information about an ingress
func GetIngressRouteDetail(client client.Interface, namespace, name string, config *rest.Config) (*IngressRouteDetail, error) {
	log.Printf("Getting details of %s ingress in %s namespace", name, namespace)

	traefikclient, err := traefik.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}
	rawIngressRoute, err := traefikclient.TraefikV1alpha1().IngressRoutes(namespace).Get(context.TODO(), name, metaV1.GetOptions{})


	if err != nil {
		return nil, err
	}

	return getIngressRouteDetail(rawIngressRoute), nil
}

func getIngressRouteDetail(i *traefikv1.IngressRoute) *IngressRouteDetail {
	return &IngressRouteDetail{
		IngressRoute: toIngressRoute(i),
		Spec:    i.Spec,
	}
}
