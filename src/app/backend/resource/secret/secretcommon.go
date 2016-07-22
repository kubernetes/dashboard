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

package secret

import (
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"

	"k8s.io/kubernetes/pkg/api"
)

func paginate(secrets []api.Secret, pQuery *common.PaginationQuery) []api.Secret {
	startIndex, endIndex := pQuery.GetPaginationSettings(len(secrets))

	// Return all items if provided settings do not meet requirements
	if !pQuery.CanPaginate(len(secrets), startIndex) {
		return secrets
	}

	return secrets[startIndex:endIndex]
}
