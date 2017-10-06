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

package config

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/configmap"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	pvc "github.com/kubernetes/dashboard/src/app/backend/resource/persistentvolumeclaim"
	"github.com/kubernetes/dashboard/src/app/backend/resource/secret"
	"k8s.io/client-go/kubernetes"
)

// Config structure contains all resource lists grouped into the config category.
type Config struct {
	ConfigMapList             configmap.ConfigMapList       `json:"configMapList"`
	PersistentVolumeClaimList pvc.PersistentVolumeClaimList `json:"persistentVolumeClaimList"`
	SecretList                secret.SecretList             `json:"secretList"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// GetConfig returns a list of all config resources in the cluster.
func GetConfig(client kubernetes.Interface, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*Config, error) {

	log.Print("Getting config category")
	channels := &common.ResourceChannels{
		ConfigMapList:             common.GetConfigMapListChannel(client, nsQuery, 1),
		SecretList:                common.GetSecretListChannel(client, nsQuery, 1),
		PersistentVolumeClaimList: common.GetPersistentVolumeClaimListChannel(client, nsQuery, 1),
	}

	return GetConfigFromChannels(channels, dsQuery, nsQuery)
}

// GetConfigFromChannels returns a list of all config in the cluster, from the
// channel sources.
func GetConfigFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery,
	nsQuery *common.NamespaceQuery) (*Config, error) {

	numErrs := 3
	errChan := make(chan error, numErrs)
	configMapChan := make(chan *configmap.ConfigMapList)
	secretChan := make(chan *secret.SecretList)
	pvcChan := make(chan *pvc.PersistentVolumeClaimList)

	go func() {
		items, err := configmap.GetConfigMapListFromChannels(channels, dsQuery)
		errChan <- err
		configMapChan <- items
	}()

	go func() {
		items, err := secret.GetSecretListFromChannels(channels, dsQuery)
		errChan <- err
		secretChan <- items
	}()

	go func() {
		pvcList, err := pvc.GetPersistentVolumeClaimListFromChannels(channels, nsQuery, dsQuery)
		errChan <- err
		pvcChan <- pvcList
	}()

	for i := 0; i < numErrs; i++ {
		err := <-errChan
		if err != nil {
			return nil, err
		}
	}

	config := &Config{
		ConfigMapList:             *(<-configMapChan),
		PersistentVolumeClaimList: *(<-pvcChan),
		SecretList:                *(<-secretChan),
	}

	config.Errors = errors.MergeErrors(config.ConfigMapList.Errors, config.PersistentVolumeClaimList.Errors,
		config.SecretList.Errors)

	return config, nil
}
