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

package node

import (
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"

	"k8s.io/kubernetes/pkg/api"
)

//getContainerImages returns container image strings from the given node.
func getContainerImages(node api.Node) []string {
	var containerImages []string
	for _, image := range node.Status.Images {
		for _, name := range image.Names {
			containerImages = append(containerImages, name)
		}
	}
	return containerImages
}

func paginate(nodes []api.Node, pQuery *common.PaginationQuery) []api.Node {
	startIndex, endIndex := pQuery.GetPaginationSettings(len(nodes))

	// Return all items if provided settings do not meet requirements
	if !pQuery.CanPaginate(len(nodes), startIndex) {
		return nodes
	}

	return nodes[startIndex:endIndex]
}