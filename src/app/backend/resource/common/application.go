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

import (
	"strings"

	"github.com/kubernetes-sigs/application/pkg/apis/app/v1alpha1"
	applicationAlphaClient "github.com/kubernetes-sigs/application/pkg/client/clientset/versioned"
	"github.com/kubernetes/dashboard/src/app/backend/api"
)

// GetApplicationForResourceDetail get Application for resource detail page
func GetApplicationForResourceDetail(namespace string, clientSig applicationAlphaClient.Interface, labels map[string]string,
	kind string) (result v1alpha1.Application, err error) {

	result = v1alpha1.Application{}
	list, err := clientSig.AppV1alpha1().Applications(namespace).List(api.ListEverything)

	for _, app := range list.Items {
		matchKinds := false
		for _, cgk := range app.Spec.ComponentGroupKinds {
			if strings.EqualFold(cgk.Kind, kind) {
				matchKinds = true
				break
			}
		}
		if !matchKinds {
			continue
		}

		for labelKey, labelValue := range labels {
			if app.Spec.Selector.MatchLabels[labelKey] == labelValue {
				result = app
				break
			}
		}
	}
	return result, err
}
