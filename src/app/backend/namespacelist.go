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

package main

import (
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
)

// List of Namespaces in the cluster.
type NamespacesList struct {
	// Unordered list of Namespaces.
	Namespaces []string `json:"namespaces"`
}

// Returns a list of all namespaces in the cluster.
func GetNamespaceList(client *client.Client) (*NamespacesList, error) {
	list, err := client.Namespaces().List(labels.Everything(), fields.Everything())

	if err != nil {
		return nil, err
	}

	namespaceList := &NamespacesList{}

	for _, element := range list.Items {
		namespaceList.Namespaces = append(namespaceList.Namespaces, element.ObjectMeta.Name)
	}

	return namespaceList, nil
}
