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

package storageclass

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

// StorageClass is a representation of a kubernetes StorageClass object.
type StorageClass struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

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

// GetStorageClass returns storage class object.
func GetStorageClass(client kubernetes.Interface, name string) (*StorageClass, error) {
	log.Printf("Getting details of %s storage class", name)

	// TODO(maciaszczykm): Use channels.
	storage, err := client.StorageV1beta1().StorageClasses().Get(name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	storageClass := ToStorageClass(storage)
	return &storageClass, nil
}
