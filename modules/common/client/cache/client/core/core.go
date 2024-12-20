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

package core

import (
	authorizationv1 "k8s.io/client-go/kubernetes/typed/authorization/v1"
	corev1 "k8s.io/client-go/kubernetes/typed/core/v1"
	"k8s.io/client-go/rest"
)

type Client struct {
	*corev1.CoreV1Client

	authorizationV1 authorizationv1.AuthorizationV1Interface
	token           string
}

func (in *Client) Pods(namespace string) corev1.PodInterface {
	return newPods(in, namespace, in.token)
}

func (in *Client) ConfigMaps(namespace string) corev1.ConfigMapInterface {
	return newConfigMaps(in, namespace, in.token)
}

func (in *Client) Secrets(namespace string) corev1.SecretInterface {
	return newSecrets(in, namespace, in.token)
}

func (in *Client) Namespaces() corev1.NamespaceInterface {
	return newNamespaces(in, in.token)
}

func (in *Client) Nodes() corev1.NodeInterface {
	return newNodes(in, in.token)
}

func (in *Client) PersistentVolumes() corev1.PersistentVolumeInterface {
	return newPersistentVolumes(in, in.token)
}

func (in *Client) PersistentVolumeClaims(namespace string) corev1.PersistentVolumeClaimInterface {
	return newPersistentVolumeClaims(in, namespace, in.token)
}

func NewClient(c *rest.Config, authorizationV1 authorizationv1.AuthorizationV1Interface, token string) (corev1.CoreV1Interface, error) {
	httpClient, err := rest.HTTPClientFor(c)
	if err != nil {
		return nil, err
	}

	client, err := corev1.NewForConfigAndClient(c, httpClient)
	if err != nil {
		return nil, err
	}

	return &Client{
		client,
		authorizationV1,
		token,
	}, nil
}
