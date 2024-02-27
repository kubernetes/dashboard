package settings

import "encoding/json"

type PinnedResource struct {
	Kind        string `json:"kind"`
	Name        string `json:"name"`
	DisplayName string `json:"displayName"`
	Namespaced  bool   `json:"namespaced"`
	Namespace   string `json:"namespace,omitempty"`
}

func (p *PinnedResource) IsEqual(other *PinnedResource) bool {
	return p.Name == other.Name && p.Namespace == other.Namespace && p.Kind == other.Kind
}

func MarshalPinnedResources(p []PinnedResource) string {
	bytes, _ := json.Marshal(p)
	return string(bytes)
}

func UnmarshalPinnedResources(data string) (*[]PinnedResource, error) {
	p := new([]PinnedResource)
	err := json.Unmarshal([]byte(data), p)
	return p, err
}
