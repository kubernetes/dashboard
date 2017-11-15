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

package storageclass

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/persistentvolume"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

// StorageClass is a representation of a kubernetes StorageClass object.
type StorageClass struct {
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
	TypeMeta   api.TypeMeta   `json:"typeMeta"`

	// provisioner is the driver expected to handle this StorageClass.
	// This is an optionally-prefixed name, like a label key.
	// For example: "kubernetes.io/gce-pd" or "kubernetes.io/aws-ebs".
	// This value may not be empty.
	Provisioner string `json:"provisioner"`

	// parameters holds parameters for the provisioner.
	// These values are opaque to the  system and are passed directly
	// to the provisioner.  The only validation done on keys is that they are
	// not empty.  The maximum number of parameters is
	// 512, with a cumulative max size of 256K
	// +optional
	Parameters map[string]string `json:"parameters"`
}

// StorageClassDetail provides the presentation layer view of Kubernetes StorageClass resource,
// It is StorageClassDetail plus PersistentVolumes associated with StorageClass.
type StorageClassDetail struct {
	ObjectMeta           api.ObjectMeta                        `json:"objectMeta"`
	TypeMeta             api.TypeMeta                          `json:"typeMeta"`
	Provisioner          string                                `json:"provisioner"`
	Parameters           map[string]string                     `json:"parameters"`
	PersistentVolumeList persistentvolume.PersistentVolumeList `json:"persistentVolumeList"`
}

// GetStorageClass returns storage class object.
func GetStorageClass(client kubernetes.Interface, name string) (*StorageClassDetail, error) {
	log.Printf("Getting details of %s storage class", name)

	storage, err := client.StorageV1().StorageClasses().Get(name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	persistentVolumeList, err := persistentvolume.GetStorageClassPersistentVolumes(client,
		storage.Name, dataselect.DefaultDataSelect)

	storageClass := toStorageClassDetail(storage, persistentVolumeList)
	return &storageClass, err
}
