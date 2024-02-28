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
