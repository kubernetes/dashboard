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

// GetServiceAccountImagePullSecrets lits of image pull secrets of given service account.
func GetServiceAccountImagePullSecrets(client k8sClient.Interface, namespace,
	name string, dsQuery *dataselect.DataSelectQuery) (*secret.SecretList, error) {
  secretList := secret.SecretList{
    Secrets: []secret.Secret{},
  }

	serviceAccount, err := client.CoreV1().ServiceAccounts(namespace).Get(context.TODO(), name, metaV1.GetOptions{})
	if err != nil {
		return &secretList, err
	}

	if serviceAccount.ImagePullSecrets == nil {
		return &secretList, nil
	}

	channels := &common.ResourceChannels{
		SecretList: common.GetSecretListChannel(client, common.NewSameNamespaceQuery(namespace), 1),
	}

	apiSecretList := <-channels.SecretList.List
	if err := <-channels.SecretList.Error; err != nil {
		return &secretList, err
	}

  imagePullSecretsMap := map[string]struct{}{}
  for _, ips := range serviceAccount.ImagePullSecrets {
    imagePullSecretsMap[ips.Name] = struct{}{}
  }

  var imagePullSecretList []v1.Secret
	for _, apiSecret := range apiSecretList.Items {
    if _, ok := imagePullSecretsMap[apiSecret.Name]; ok {
      imagePullSecretList = append(imagePullSecretList, apiSecret)
    }
  }

	return secret.ToSecretList(imagePullSecretList, []error{}, dsQuery), nil
}
