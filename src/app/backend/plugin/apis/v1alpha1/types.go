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

package v1alpha1

import (
	coreV1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// +genclient
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// Plugin holds the object information for Plugin kind, it also implements runtime.Object
type Plugin struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec PluginSpec `json:"spec"`
}

// PluginSpec holds the specs for the Plugin kind
type PluginSpec struct {
	Source       Source   `json:"source"`
	Dependencies []string `json:"dependencies,omitempty"`
}

// Source holds the information about the plugin's source code origin
type Source struct {
	Filename     string                     `json:"filename,omitempty"`
	ConfigMapRef *coreV1.ConfigMapEnvSource `json:"configMapRef,omitempty" protobuf:"bytes,1,opt,name=configMapRef"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// PluginList holds the list information for Plugin kind, it also implements runtime.Object
type PluginList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata"`

	Items []Plugin `json:"items"`
}
