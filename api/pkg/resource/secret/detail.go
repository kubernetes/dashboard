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

package secret

import (
	"context"
	"log"

	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

// SecretDetail API resource provides mechanisms to inject containers with configuration data while keeping
// containers agnostic of Kubernetes
type SecretDetail struct {
	// Extends list item structure.
	Secret `json:",inline"`

	// Data contains the secret data.  Each key must be a valid DNS_SUBDOMAIN
	// or leading dot followed by valid DNS_SUBDOMAIN.
	// The serialized form of the secret data is a base64 encoded string,
	// representing the arbitrary (possibly non-string) data value here.
	Data map[string][]byte `json:"data"`
}

// GetSecretDetail returns detailed information about a secret
func GetSecretDetail(client kubernetes.Interface, namespace, name string) (*SecretDetail, error) {
	log.Printf("Getting details of %s secret in %s namespace\n", name, namespace)

	rawSecret, err := client.CoreV1().Secrets(namespace).Get(context.TODO(), name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	return getSecretDetail(rawSecret), nil
}

func getSecretDetail(rawSecret *v1.Secret) *SecretDetail {
	return &SecretDetail{
		Secret: toSecret(rawSecret),
		Data:   rawSecret.Data,
	}
}
