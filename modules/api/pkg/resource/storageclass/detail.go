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
	"context"

	storage "k8s.io/api/storage/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/klog/v2"
)

// StorageClassDetail provides the presentation layer view of Storage Class resource.
type StorageClassDetail struct {
	// Extends list item structure.
	StorageClass `json:",inline"`
}

// GetStorageClass returns Storage Class resource.
func GetStorageClass(client kubernetes.Interface, name string) (*StorageClassDetail, error) {
	klog.V(4).Infof("Getting details of %s storage class", name)

	sc, err := client.StorageV1().StorageClasses().Get(context.TODO(), name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	storageClass := toStorageClassDetail(sc)
	return &storageClass, err
}

func toStorageClassDetail(storageClass *storage.StorageClass) StorageClassDetail {
	return StorageClassDetail{
		StorageClass: toStorageClass(storageClass),
	}
}
