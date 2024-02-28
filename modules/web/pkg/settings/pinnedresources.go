// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package settings

import "encoding/json"

type PinnedResource struct {
	Kind        string `json:"kind"`
	Name        string `json:"name"`
	DisplayName string `json:"displayName"`
	Namespaced  bool   `json:"namespaced"`
	Namespace   string `json:"namespace,omitempty"`
}

func (p *PinnedResource) Equals(other *PinnedResource) bool {
	return p.Name == other.Name && p.Namespace == other.Namespace && p.Kind == other.Kind
}

type PinnedResources []PinnedResource

func (p PinnedResources) IndexOf(r *PinnedResource) int {
	index := -1
	for i, pinnedResource := range p {
		if pinnedResource.Equals(r) {
			index = i
		}
	}

	return index
}

func (p PinnedResources) Includes(r *PinnedResource) bool {
	return p.IndexOf(r) >= 0
}

func (p PinnedResources) DeleteAt(index int, count int) PinnedResources {
	if index < 0 || index > len(p) {
		return p
	}

	if index+count >= len(p) {
		return p[:index]
	}

	return append(p[:index], p[index+count:]...)
}

func (p PinnedResources) Delete(r *PinnedResource) PinnedResources {
	index := p.IndexOf(r)
	if index >= 0 {
		return p.DeleteAt(index, 1)
	}

	return p
}

func (p PinnedResources) Marshal() string {
	bytes, _ := json.Marshal(p)
	return string(bytes)
}

func UnmarshalPinnedResources(data string) (*[]PinnedResource, error) {
	p := new([]PinnedResource)
	err := json.Unmarshal([]byte(data), p)
	return p, err
}
