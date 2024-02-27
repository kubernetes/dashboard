package helpers

import (
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/fields"
	"k8s.io/apimachinery/pkg/labels"
)

// IsSelectorMatching returns true when an object with the given selector targets the same
// Resources (or subset) that the target object with the given selector.
func IsSelectorMatching(srcSelector map[string]string, targetObjectLabels map[string]string) bool {
	// If service has no selectors, then assume it targets different resource.
	if len(srcSelector) == 0 {
		return false
	}
	for label, value := range srcSelector {
		if rsValue, ok := targetObjectLabels[label]; !ok || rsValue != value {
			return false
		}
	}
	return true
}

// IsLabelSelectorMatching returns true when a resource with the given selector targets the same
// Resources(or subset) that a target object selector with the given selector.
func IsLabelSelectorMatching(srcSelector map[string]string, targetLabelSelector *metaV1.LabelSelector) bool {
	// Check to see if targetLabelSelector pointer is not nil.
	if targetLabelSelector != nil {
		targetObjectLabels := targetLabelSelector.MatchLabels
		return IsSelectorMatching(srcSelector, targetObjectLabels)
	}
	return false
}

// ListEverything is a list options used to list all resources without any filtering.
var ListEverything = metaV1.ListOptions{
	LabelSelector: labels.Everything().String(),
	FieldSelector: fields.Everything().String(),
}
