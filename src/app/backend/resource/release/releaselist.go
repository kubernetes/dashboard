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

package release

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"

	heapster "github.com/kubernetes/dashboard/src/app/backend/client"

	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	"k8s.io/helm/pkg/helm"
	"k8s.io/helm/pkg/proto/hapi/release"
)

// ReleaseList contains a list of Releases in the cluster.
type ReleaseList struct {
	ListMeta common.ListMeta `json:"listMeta"`

	// Unordered list of Releases.
	Releases          []*release.Release `json:"releases"`
	CumulativeMetrics []metric.Metric    `json:"cumulativeMetrics"`
}

// GetReleaseList returns a list of all Releases in the cluster.
func GetReleaseList(tiller *helm.Client, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery, heapsterClient *heapster.HeapsterClient) (*ReleaseList, error) {
	log.Printf("Getting list of all releases in the cluster")

	channels := &common.ResourceChannels{
		ReleaseList: common.GetReleaseListChannel(tiller, nsQuery, 1),
	}

	return GetReleaseListFromChannels(channels, dsQuery, heapsterClient)
}

// GetReleaseList returns a list of all Releases in the cluster
// reading required resource list once from the channels.
func GetReleaseListFromChannels(channels *common.ResourceChannels,
	dsQuery *dataselect.DataSelectQuery, heapsterClient *heapster.HeapsterClient) (*ReleaseList, error) {

	releases := <-channels.ReleaseList.List
	if err := <-channels.ReleaseList.Error; err != nil {
		return nil, err
	}

	return CreateReleaseList(releases.Items), nil
}

// CreateReleaseList returns a list of all Release model objects in the cluster, based on all
// Kubernetes Release API objects.
func CreateReleaseList(releases []*release.Release) *ReleaseList {
	releaseList := &ReleaseList{
		Releases:          releases,
		ListMeta:          common.ListMeta{TotalItems: len(releases)},
		CumulativeMetrics: []metric.Metric{},
	}
	return releaseList
}
