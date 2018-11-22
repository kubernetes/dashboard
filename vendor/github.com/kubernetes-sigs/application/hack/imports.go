/*
Copyright 2018 The Kubernetes Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package hack

/*
Package imports imports dependencies required for "dep ensure" to fetch all of the go package dependencies needed
by kubebuilder commands to work without rerunning "dep ensure".

Example: make sure the testing libraries and apimachinery libraries are fetched by "dep ensure" so that
dep ensure doesn't need to be rerun after "kubebuilder create resource".

This is necessary for subsequent commands - such as building docs, tests, etc - to work without rerunning "dep ensure"
afterward.
*/
import _ "github.com/kubernetes-sigs/kubebuilder/pkg/imports"
