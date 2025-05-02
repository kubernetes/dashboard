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
