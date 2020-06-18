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

package serviceaccount

import (
	"context"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/secret"
	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sClient "k8s.io/client-go/kubernetes"
)

// GetServiceAccountImagePullSecrets list image pull secrets of given service account.
func GetServiceAccountImagePullSecrets(client k8sClient.Interface, namespace,
	name string, dsQuery *dataselect.DataSelectQuery) (*secret.SecretList, error) {
	imagePullSecretList := secret.SecretList{
		Secrets: []secret.Secret{},
	}

	serviceAccount, err := client.CoreV1().ServiceAccounts(namespace).Get(context.TODO(), name, metaV1.GetOptions{})
	if err != nil {
		return &imagePullSecretList, err
	}

	if serviceAccount.ImagePullSecrets == nil {
		return &imagePullSecretList, nil
	}

	channels := &common.ResourceChannels{
		SecretList: common.GetSecretListChannel(client, common.NewSameNamespaceQuery(namespace), 1),
	}

	apiSecretList := <-channels.SecretList.List
	if err := <-channels.SecretList.Error; err != nil {
		return &imagePullSecretList, err
	}

	imagePullSecretsMap := map[string]struct{}{}
	for _, ips := range serviceAccount.ImagePullSecrets {
		imagePullSecretsMap[ips.Name] = struct{}{}
	}

	var rawImagePullSecretList []v1.Secret
	for _, apiSecret := range apiSecretList.Items {
		if _, ok := imagePullSecretsMap[apiSecret.Name]; ok {
			rawImagePullSecretList = append(rawImagePullSecretList, apiSecret)
		}
	}

	return secret.ToSecretList(rawImagePullSecretList, []error{}, dsQuery), nil
}

// GetServiceAccountSecrets list secrets of given service account.
// Note: Secrets are referenced by ObjectReference compared to image pull secrets LocalObjectReference but still only
// the name field is used and most of the time other fields are empty. Because of that we are using only the name field
// to find referenced objects assuming that the namespace is the same. ObjectReference is being slowly replaced with
// more specific types.
func GetServiceAccountSecrets(client k8sClient.Interface, namespace,
	name string, dsQuery *dataselect.DataSelectQuery) (*secret.SecretList, error) {
	secretList := secret.SecretList{
		Secrets: []secret.Secret{},
	}

	serviceAccount, err := client.CoreV1().ServiceAccounts(namespace).Get(context.TODO(), name, metaV1.GetOptions{})
	if err != nil {
		return &secretList, err
	}

	if serviceAccount.Secrets == nil {
		return &secretList, nil
	}

	channels := &common.ResourceChannels{
		SecretList: common.GetSecretListChannel(client, common.NewSameNamespaceQuery(namespace), 1),
	}

	apiSecretList := <-channels.SecretList.List
	if err := <-channels.SecretList.Error; err != nil {
		return &secretList, err
	}

	secretsMap := map[string]v1.ObjectReference{}
	for _, s := range serviceAccount.Secrets {
		secretsMap[s.Name] = s
	}

	var rawSecretList []v1.Secret
	for _, apiSecret := range apiSecretList.Items {
		if _, ok := secretsMap[apiSecret.Name]; ok {
			rawSecretList = append(rawSecretList, apiSecret)
		}
	}

	return secret.ToSecretList(rawSecretList, []error{}, dsQuery), nil
}
