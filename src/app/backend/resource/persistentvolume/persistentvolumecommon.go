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

package persistentvolume

import (
	"k8s.io/kubernetes/pkg/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
)

func paginate(persistentVolumes []api.PersistentVolume, pQuery *common.PaginationQuery) []api.PersistentVolume {
	startIndex, endIndex := pQuery.GetPaginationSettings(len(persistentVolumes))

	// Return all items if provided settings do not meet requirements
	if !pQuery.CanPaginate(len(persistentVolumes), startIndex) {
		return persistentVolumes
	}

	return persistentVolumes[startIndex:endIndex]
}
