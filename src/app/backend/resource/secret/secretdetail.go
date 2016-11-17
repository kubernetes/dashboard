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

package secret

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/api"
	client "k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset"
)

// SecretDetail API resource provides mechanisms to inject containers with configuration data while keeping
// containers agnostic of Kubernetes
type SecretDetail struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Data contains the secret data.  Each key must be a valid DNS_SUBDOMAIN
	// or leading dot followed by valid DNS_SUBDOMAIN.
	// The serialized form of the secret data is a base64 encoded string,
	// representing the arbitrary (possibly non-string) data value here.
	Data map[string][]byte `json:"data"`

	// Used to facilitate programmatic handling of secret data.
	Type api.SecretType `json:"type"`
}

// GetSecretDetail returns returns detailed information about a secret
func GetSecretDetail(client *client.Clientset, namespace, name string) (*SecretDetail, error) {
	log.Printf("Getting details of %s secret in %s namespace", name, namespace)

	rawSecret, err := client.Secrets(namespace).Get(name)

	if err != nil {
		return nil, err
	}

	return getSecretDetail(rawSecret), nil
}

func getSecretDetail(rawSecret *api.Secret) *SecretDetail {
	return &SecretDetail{
		ObjectMeta: common.NewObjectMeta(rawSecret.ObjectMeta),
		TypeMeta:   common.NewTypeMeta(common.ResourceKindSecret),
		Data:       rawSecret.Data,
		Type:       rawSecret.Type,
	}
}
