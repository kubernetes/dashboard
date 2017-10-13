// Copyright 2017 The Kubernetes Dashboard Authors.
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

package customresourcedefinition

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/serializer"
	"k8s.io/client-go/rest"

	"k8s.io/apiextensions-apiserver/pkg/client/clientset/internalclientset/scheme"
	"k8s.io/apimachinery/pkg/runtime/schema"
)

func newRESTClient(config *rest.Config, groupVersion schema.GroupVersion) (*rest.RESTClient, error) {
	schemeBuilder := runtime.NewSchemeBuilder(
		func(scheme *runtime.Scheme) error {
			scheme.AddKnownTypes(
				groupVersion,
				&metav1.ListOptions{},
				&metav1.DeleteOptions{},
				&CustomResourceDefinitionObj{},
				&CustomResourceDefinitionObjList{},
			)
			return nil
		})
	if err := schemeBuilder.AddToScheme(scheme.Scheme); err != nil {
		return nil, err
	}

	config.GroupVersion = &groupVersion
	config.APIPath = "/apis"
	config.ContentType = runtime.ContentTypeJSON
	config.NegotiatedSerializer = serializer.DirectCodecFactory{CodecFactory: scheme.Codecs}

	client, err := rest.RESTClientFor(config)
	if err != nil {
		return nil, err
	}

	return client, nil
}
