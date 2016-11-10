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

package config

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/configmap"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/secret"
	k8sClient "k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset"
)

// Config structure contains all resource lists grouped into the config category.
type Config struct {
	ConfigMapList configmap.ConfigMapList `json:"configMapList"`

	SecretList secret.SecretList `json:"secretList"`
}

// GetConfig returns a list of all config resources in the cluster.
func GetConfig(client *k8sClient.Clientset, nsQuery *common.NamespaceQuery) (
	*Config, error) {

	log.Print("Getting config category")
	channels := &common.ResourceChannels{
		ConfigMapList: common.GetConfigMapListChannel(client, nsQuery, 1),
		SecretList:    common.GetSecretListChannel(client, nsQuery, 1),
	}

	return GetConfigFromChannels(channels)
}

// GetConfigFromChannels returns a list of all config in the cluster, from the
// channel sources.
func GetConfigFromChannels(channels *common.ResourceChannels) (
	*Config, error) {

	configMapChan := make(chan *configmap.ConfigMapList)
	secretChan := make(chan *secret.SecretList)
	numErrs := 2
	errChan := make(chan error, numErrs)

	go func() {
		items, err := configmap.GetConfigMapListFromChannels(channels,
			dataselect.DefaultDataSelect)
		errChan <- err
		configMapChan <- items
	}()

	go func() {
		items, err := secret.GetSecretListFromChannels(channels, dataselect.DefaultDataSelect)
		errChan <- err
		secretChan <- items
	}()

	for i := 0; i < numErrs; i++ {
		err := <-errChan
		if err != nil {
			return nil, err
		}
	}

	config := &Config{
		ConfigMapList: *(<-configMapChan),
		SecretList:    *(<-secretChan),
	}

	return config, nil
}
