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

package release

import (
	"log"

	"k8s.io/helm/pkg/helm"
	"k8s.io/helm/pkg/proto/hapi/release"
)

// GetReleaseDetail returns model object of release and error, if any.
func GetReleaseDetail(tiller *helm.Client, namespace string,
	name string) (*release.Release, error) {

	log.Printf("Getting details of %s release in %s namespace", name, namespace)

	resp, err := tiller.ReleaseContent(name)
	if err != nil {
		return nil, err
	}

	return resp.Release, nil
}
