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

package extensions

import (
	v1 "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset/typed/apiextensions/v1"
	authorizationv1 "k8s.io/client-go/kubernetes/typed/authorization/v1"
	"k8s.io/client-go/rest"

	"k8s.io/dashboard/client/cache/client/common"
)

type Client struct {
	*v1.ApiextensionsV1Client

	authorizationV1 authorizationv1.AuthorizationV1Interface
	token           string
	requestGetter   common.RequestGetter
}

func (in *Client) CustomResourceDefinitions() v1.CustomResourceDefinitionInterface {
	return newCustomResourceDefinitions(in, in.token, in.requestGetter)
}

func NewClient(c *rest.Config, authorizationV1 authorizationv1.AuthorizationV1Interface, opts common.CachedClientOptions) (v1.ApiextensionsV1Interface, error) {
	httpClient, err := rest.HTTPClientFor(c)
	if err != nil {
		return nil, err
	}

	client, err := v1.NewForConfigAndClient(c, httpClient)
	if err != nil {
		return nil, err
	}

	return &Client{
		client,
		authorizationV1,
		opts.Token,
		opts.RequestGetter,
	}, nil
}
