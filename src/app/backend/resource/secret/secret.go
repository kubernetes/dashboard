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
	"k8s.io/kubernetes/pkg/api"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
)

// SecretSpec - common interface for the specification of different secrets.
type SecretSpec interface {
	GetName() string
	GetType() api.SecretType
	GetNamespace() string
	GetData() map[string][]byte
}

// ImagePullSecretSpec - specification of an image pull secret
// implements SecretSpec
type ImagePullSecretSpec struct {
	Name      string `json:"name"`
	Namespace string `json:"namespace"`
	// The value of the .dockercfg property. It must be Base64 encoded.
	Data []byte `json:"data"`
}

// GetName - return the name of the ImagePullSecret
func (spec *ImagePullSecretSpec) GetName() string {
	return spec.Name
}

// GetType - return the type of the ImagePullSecret,
// which is always api.SecretTypeDockercfg
func (spec *ImagePullSecretSpec) GetType() api.SecretType {
	return api.SecretTypeDockercfg
}

// GetNamespace - return the namespace of the ImagePullSecret
func (spec *ImagePullSecretSpec) GetNamespace() string {
	return spec.Namespace
}

// GetData - return the data the secret carries, it is a single
// key-value pair
func (spec *ImagePullSecretSpec) GetData() map[string][]byte {
	return map[string][]byte{api.DockerConfigKey: spec.Data}
}

// Secret - a single secret returned to the frontend.
type Secret struct {
	Name string `json:"name"`
}

// SecretsList - response structure for a queried secrets list.
type SecretsList struct {
	Secrets []string `json:"secrets"`
}

// GetSecrets - return all secrets in the given namespace.
func GetSecrets(client *client.Client, namespace string) (*SecretsList,
	error) {
	secretsList := &SecretsList{}
	secrets, err := client.Secrets(namespace).List(api.ListOptions{
		LabelSelector: labels.Everything(),
		FieldSelector: fields.Everything(),
	})
	if err != nil {
		return nil, err
	}
	for _, secret := range secrets.Items {
		secretsList.Secrets = append(secretsList.Secrets, secret.ObjectMeta.Name)
	}
	return secretsList, err
}

// CreateSecret - create a single secret using the cluster API client
func CreateSecret(client *client.Client, spec SecretSpec) (*Secret, error) {
	namespace := spec.GetNamespace()
	secret := &api.Secret{
		ObjectMeta: api.ObjectMeta{
			Name:      spec.GetName(),
			Namespace: namespace,
		},
		Type: spec.GetType(),
		Data: spec.GetData(),
	}
	_, err := client.Secrets(namespace).Create(secret)
	return &Secret{Name: secret.ObjectMeta.Name}, err
}
