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

package api

import (
	"github.com/emicklei/go-restful/v3"
	v1 "k8s.io/api/authorization/v1"
	apiextensionsclientset "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/tools/clientcmd/api"

	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	pluginclientset "github.com/kubernetes/dashboard/src/app/backend/plugin/client/clientset/versioned"
)

const (
	// CsrfTokenSecretName is the resource information that are used as csrf token storage. Can be accessible by multiple dashboard replicas.
	CsrfTokenSecretName = "kubernetes-dashboard-csrf"

	// CsrfTokenSecretData is the name of the data var that holds the csrf token inside the secret.
	CsrfTokenSecretData = "csrf"
)

// ClientManager is responsible for initializing and creating clients to communicate with
// kubernetes apiserver on demand.
type ClientManager interface {
	Client(req *restful.Request) (kubernetes.Interface, error)
	InsecureClient() kubernetes.Interface
	APIExtensionsClient(req *restful.Request) (apiextensionsclientset.Interface, error)
	PluginClient(req *restful.Request) (pluginclientset.Interface, error)
	InsecureAPIExtensionsClient() apiextensionsclientset.Interface
	InsecurePluginClient() pluginclientset.Interface
	CanI(req *restful.Request, ssar *v1.SelfSubjectAccessReview) bool
	Config(req *restful.Request) (*rest.Config, error)
	ClientCmdConfig(req *restful.Request) (clientcmd.ClientConfig, error)
	CSRFKey() string
	HasAccess(authInfo api.AuthInfo) (string, error)
	VerberClient(req *restful.Request, config *rest.Config) (ResourceVerber, error)
	SetTokenManager(manager authApi.TokenManager)
}

// ResourceVerber is responsible for performing generic CRUD operations on all supported resources.
type ResourceVerber interface {
	Put(kind string, namespaceSet bool, namespace string, name string,
		object *runtime.Unknown) error
	Get(kind string, namespaceSet bool, namespace string, name string) (runtime.Object, error)
	Delete(kind string, namespaceSet bool, namespace string, name string) error
}

// CanIResponse is used to as response to check whether or not user is allowed to access given endpoint.
type CanIResponse struct {
	Allowed bool `json:"allowed"`
}

// CsrfTokenManager is responsible for generating, reading and updating token stored in a secret.
type CsrfTokenManager interface {
	// Token returns current csrf token used for csrf signing.
	Token() string
}
