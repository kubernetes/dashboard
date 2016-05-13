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

package namespace

import (
	"log"

	"k8s.io/kubernetes/pkg/api"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
)

// NamespaceSpec is a specification of namespace to create.
type NamespaceSpec struct {
	// Name of the namespace.
	Name string `json:"name"`
}

// NamespaceList is a list of namespaces in the cluster.
type NamespaceList struct {
	// Unordered list of Namespaces.
	Namespaces []string `json:"namespaces"`
}

// CreateNamespace creates namespace based on given specification.
func CreateNamespace(spec *NamespaceSpec, client *client.Client) error {
	log.Printf("Creating namespace %s", spec.Name)

	namespace := &api.Namespace{
		ObjectMeta: api.ObjectMeta{
			Name: spec.Name,
		},
	}

	_, err := client.Namespaces().Create(namespace)

	return err
}

// GetNamespaceList returns a list of all namespaces in the cluster.
func GetNamespaceList(client *client.Client) (*NamespaceList, error) {
	log.Printf("Getting namespace list")

	list, err := client.Namespaces().List(api.ListOptions{
		LabelSelector: labels.Everything(),
		FieldSelector: fields.Everything(),
	})

	if err != nil {
		return nil, err
	}

	namespaceList := &NamespaceList{}

	for _, element := range list.Items {
		namespaceList.Namespaces = append(namespaceList.Namespaces, element.ObjectMeta.Name)
	}

	return namespaceList, nil
}
