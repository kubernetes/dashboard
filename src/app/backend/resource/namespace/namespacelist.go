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

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"k8s.io/kubernetes/pkg/api"
	client "k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
)

// NamespaceList contains a list of namespaces in the cluster.
type NamespaceList struct {
	ListMeta common.ListMeta `json:"listMeta"`

	// Unordered list of Namespaces.
	Namespaces []Namespace `json:"namespaces"`
}

// Namespace is a presentation layer view of Kubernetes namespaces. This means it is namespace plus
// additional augmented data we can get from other sources.
type Namespace struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Phase is the current lifecycle phase of the namespace.
	Phase api.NamespacePhase `json:"phase"`
}

// GetNamespaceListFromChannels returns a list of all namespaces in the cluster.
func GetNamespaceListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery) (*NamespaceList,
	error) {
	log.Printf("Getting namespace list")

	namespaces := <-channels.NamespaceList.List
	if err := <-channels.NamespaceList.Error; err != nil {
		return nil, err
	}

	return toNamespaceList(namespaces.Items, dsQuery), nil
}

// GetNamespaceList returns a list of all namespaces in the cluster.
func GetNamespaceList(client *client.Clientset, dsQuery *dataselect.DataSelectQuery) (*NamespaceList,
	error) {
	log.Printf("Getting namespace list")

	namespaces, err := client.Namespaces().List(api.ListOptions{
		LabelSelector: labels.Everything(),
		FieldSelector: fields.Everything(),
	})

	if err != nil {
		return nil, err
	}

	return toNamespaceList(namespaces.Items, dsQuery), nil
}

func toNamespaceList(namespaces []api.Namespace, dsQuery *dataselect.DataSelectQuery) *NamespaceList {
	namespaceList := &NamespaceList{
		Namespaces: make([]Namespace, 0),
		ListMeta:   common.ListMeta{TotalItems: len(namespaces)},
	}

	namespaces = fromCells(dataselect.GenericDataSelect(toCells(namespaces), dsQuery))

	for _, namespace := range namespaces {
		namespaceList.Namespaces = append(namespaceList.Namespaces, toNamespace(namespace))
	}

	return namespaceList
}

func toNamespace(namespace api.Namespace) Namespace {
	return Namespace{
		ObjectMeta: common.NewObjectMeta(namespace.ObjectMeta),
		TypeMeta:   common.NewTypeMeta(common.ResourceKindNamespace),
		Phase:      namespace.Status.Phase,
	}
}
