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

package common

// ResourceStatus provides basic information about resources status on the list.
type ResourceStatus struct {
	// Number of resources that are currently in running state.
	Running int `json:"running"`

	// Number of resources that are currently in pending state.
	Pending int `json:"pending"`

	// Number of resources that are in failed state.
	Failed int `json:"failed"`

	// Number of resources that are in succeeded state.
	Succeeded int `json:"succeeded"`

	// Number of resources that are in terminating state.
	Terminating int `json:"terminating"`
}
