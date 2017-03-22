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

package configmap

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	client "k8s.io/client-go/kubernetes"
	api "k8s.io/client-go/pkg/api/v1"
)

// ConfigMapDetail API resource provides mechanisms to inject containers with configuration data while keeping
// containers agnostic of Kubernetes
type ConfigMapDetail struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Data contains the configuration data.
	// Each key must be a valid DNS_SUBDOMAIN with an optional leading dot.
	Data map[string]string `json:"data,omitempty"`
}

// GetConfigMapDetail returns detailed information about a config map
func GetConfigMapDetail(client *client.Clientset, namespace, name string) (*ConfigMapDetail, error) {
	log.Printf("Getting details of %s config map in %s namespace", name, namespace)

	rawConfigMap, err := client.ConfigMaps(namespace).Get(name, metaV1.GetOptions{})

	if err != nil {
		return nil, err
	}

	return getConfigMapDetail(rawConfigMap), nil
}

func getConfigMapDetail(rawConfigMap *api.ConfigMap) *ConfigMapDetail {
	return &ConfigMapDetail{
		ObjectMeta: common.NewObjectMeta(rawConfigMap.ObjectMeta),
		TypeMeta:   common.NewTypeMeta(common.ResourceKindConfigMap),
		Data:       rawConfigMap.Data,
	}
}
