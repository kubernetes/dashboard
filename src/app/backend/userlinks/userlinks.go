// Copyright 2017 The Kubernetes Dashboard Authors.
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

package userlinks

import (
	"encoding/json"
	"log"
	"net/url"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sClient "k8s.io/client-go/kubernetes"
)

const (
	annotationObj = "alpha.dashboard.kubernetes.io/links"
)

// UserLink is an optional annotation attached to the pod or service resource objects.
type UserLink struct {
	// Description is the key specified in the annotationObj set
	Description string `json:"description"`
	// Link is the value specified in the annotationObj set
	Link string `json:"link"`
	// Link status
	IsURLValid bool `json:"isURLValid"`
	// Is it a proxyURL
	IsProxyURL bool `json:"isProxyURL"`
}

// GetUserLinks delegates getting of user links based on passed in resource kind (ResourceKindService, ResourceKindPod)
func GetUserLinks(client k8sClient.Interface, namespace, name, resource string) (userLinks []UserLink, err error) {
	log.Printf("Getting %s resource in %s namespace", name, namespace)

	switch {
	case resource == api.ResourceKindPersistentVolume:
		return getPersistentVolumeLinks(client, namespace, name)
	default:
		log.Printf("Unknown resource types %T!\n", resource)
	}
	return
}

// getPersistentVolumeLinks get userlinks for persistentvolume
func getPersistentVolumeLinks(client k8sClient.Interface, namespace, name string) ([]UserLink, error) {
	userLinks := []UserLink{}
	persistentVolume, err := client.CoreV1().PersistentVolumes().Get(name, metaV1.GetOptions{})

	if err != nil || len(persistentVolume.Annotations[annotationObj]) == 0 {
		return userLinks, err
	}

	m := map[string]string{}
	err = json.Unmarshal([]byte(persistentVolume.Annotations[annotationObj]), &m)
	if err != nil {
		return userLinks, err
	}

	for key, uri := range m {
		userLink := new(UserLink)
		userLink.Description = key
		if _, err := url.ParseRequestURI(uri); err != nil {
			userLink.Link = "Invalid User Link: " + uri
		} else {
			userLink.Link = uri
			userLink.IsURLValid = true
		}
		userLinks = append(userLinks, *userLink)
	}
	return userLinks, err
}
