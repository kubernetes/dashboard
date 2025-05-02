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

package client

import (
	extensionsclient "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"
	v1 "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset/typed/apiextensions/v1"
	authorizationv1 "k8s.io/client-go/kubernetes/typed/authorization/v1"
	"k8s.io/client-go/rest"

	"k8s.io/dashboard/client/cache/client/extensions"
)

// CachedExtensionsInterface is a custom wrapper around the [extensionsclient.Interface].
// It allows certain requests such as CRD LIST to be cached to optimize
// the response time. It is especially helpful when dealing with
// clusters with big amount of resources.
type CachedExtensionsInterface interface {
	extensionsclient.Interface
}

type cachedExtensionsClientset struct {
	*extensionsclient.Clientset

	apiextensionsV1 v1.ApiextensionsV1Interface
}

func (in *cachedExtensionsClientset) ApiextensionsV1() v1.ApiextensionsV1Interface {
	return in.apiextensionsV1
}

func NewCachedExtensionsClient(config *rest.Config, authorizationV1 authorizationv1.AuthorizationV1Interface, token string) (CachedExtensionsInterface, error) {
	var cs cachedExtensionsClientset
	var err error

	configShallowCopy := *config
	if configShallowCopy.UserAgent == "" {
		configShallowCopy.UserAgent = rest.DefaultKubernetesUserAgent()
	}

	clientset, err := extensionsclient.NewForConfig(&configShallowCopy)
	if err != nil {
		return nil, err
	}

	cs.apiextensionsV1, err = extensions.NewClient(&configShallowCopy, authorizationV1, token)
	if err != nil {
		return nil, err
	}

	cs.Clientset = clientset
	return &cs, nil
}
