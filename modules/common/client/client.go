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
	"context"
	"fmt"
	"net/http"
	"os"

	v1 "k8s.io/api/authorization/v1"
	apiextensionsclientset "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	client "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/client/args"
	cacheclient "k8s.io/dashboard/client/cache/client"
)

func InClusterClient() client.Interface {
	if !isInitialized() {
		return nil
	}

	if inClusterClient != nil {
		return inClusterClient
	}

	// init on-demand only
	c, err := client.NewForConfig(baseConfig)
	if err != nil {
		klog.ErrorS(err, "Could not init kubernetes in-cluster client")
		os.Exit(1)
	}

	// initialize in-memory client
	inClusterClient = c
	return inClusterClient
}

func Client(request *http.Request) (client.Interface, error) {
	if !isInitialized() {
		return nil, fmt.Errorf("client package not initialized")
	}

	config, err := configFromRequest(request)
	if err != nil {
		return nil, err
	}

	if args.CacheEnabled() {
		return cacheclient.New(config, GetBearerToken(request))
	}

	return client.NewForConfig(config)
}

func APIExtensionsClient(request *http.Request) (apiextensionsclientset.Interface, error) {
	if !isInitialized() {
		return nil, fmt.Errorf("client package not initialized")
	}

	config, err := configFromRequest(request)
	if err != nil {
		return nil, err
	}

	kubeClient, err := client.NewForConfig(config)
	if err != nil {
		return nil, err
	}

	if args.CacheEnabled() {
		return cacheclient.NewCachedExtensionsClient(config, kubeClient.AuthorizationV1(), GetBearerToken(request))
	}

	return apiextensionsclientset.NewForConfig(config)
}

func Config(request *http.Request) (*rest.Config, error) {
	if !isInitialized() {
		return nil, fmt.Errorf("client package not initialized")
	}

	return configFromRequest(request)
}

func RestClientForHost(host string) (rest.Interface, error) {
	config := setConfigRateLimitDefaults(&rest.Config{Host: host})
	restClient, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, err
	}

	return restClient.RESTClient(), nil
}

func CanI(request *http.Request, ssar *v1.SelfSubjectAccessReview) bool {
	k8sClient, err := Client(request)
	if err != nil {
		klog.ErrorS(err, "Could not init kubernetes client")
		return false
	}

	response, err := k8sClient.AuthorizationV1().SelfSubjectAccessReviews().Create(context.TODO(), ssar, metaV1.CreateOptions{})
	if err != nil {
		klog.ErrorS(err, "Could not create SelfSubjectAccessReview")
		return false
	}

	return response.Status.Allowed
}
