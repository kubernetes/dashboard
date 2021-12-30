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

package client

import (
	"context"
	"fmt"

	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"

	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	restclient "k8s.io/client-go/rest"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	clientapi "github.com/kubernetes/dashboard/src/app/backend/client/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/customresourcedefinition"
)

// resourceVerber is a struct responsible for doing common verb operations on resources, like
// DELETE, PUT, UPDATE.
type resourceVerber struct {
	client              RESTClient
	appsClient          RESTClient
	batchClient         RESTClient
	betaBatchClient     RESTClient
	autoscalingClient   RESTClient
	storageClient       RESTClient
	rbacClient          RESTClient
	networkingClient    RESTClient
	apiExtensionsClient RESTClient
	pluginsClient       RESTClient
	config              *restclient.Config
}

type crdInfo struct {
	version    string
	group      string
	pluralName string
	namespaced bool
}

func (verber *resourceVerber) getRESTClientByType(clientType api.ClientType) RESTClient {
	switch clientType {
	case api.ClientTypeAppsClient:
		return verber.appsClient
	case api.ClientTypeBatchClient:
		return verber.batchClient
	case api.ClientTypeBetaBatchClient:
		return verber.betaBatchClient
	case api.ClientTypeAutoscalingClient:
		return verber.autoscalingClient
	case api.ClientTypeStorageClient:
		return verber.storageClient
	case api.ClientTypeRbacClient:
		return verber.rbacClient
	case api.ClientTypeNetworkingClient:
		return verber.networkingClient
	case api.ClientTypeAPIExtensionsClient:
		return verber.apiExtensionsClient
	case api.ClientTypePluginsClient:
		return verber.pluginsClient
	default:
		return verber.client
	}
}

func (verber *resourceVerber) getResourceSpecFromKind(kind string, namespaceSet bool) (client RESTClient, resourceSpec api.APIMapping, err error) {
	resourceSpec, ok := api.KindToAPIMapping[kind]
	if !ok {
		var crdInfo crdInfo

		// check if kind is CRD
		crdInfo, err = verber.getCRDGroupAndVersion(kind)
		if err != nil {
			return
		}

		client, err = customresourcedefinition.NewRESTClient(verber.config, crdInfo.group, crdInfo.version)
		if err != nil {
			return
		}

		resourceSpec = api.APIMapping{
			Resource:   crdInfo.pluralName,
			Namespaced: crdInfo.namespaced,
		}
	}

	if namespaceSet != resourceSpec.Namespaced {
		if namespaceSet {
			err = errors.NewInvalid(fmt.Sprintf("Set namespace for not-namespaced resource kind: %s", kind))
			return
		}
		err = errors.NewInvalid(fmt.Sprintf("Set no namespace for namespaced resource kind: %s", kind))
		return
	}

	if client == nil {
		client = verber.getRESTClientByType(resourceSpec.ClientType)
	}
	return
}

func (verber *resourceVerber) getCRDGroupAndVersion(kind string) (info crdInfo, err error) {
	var crdv1 apiextensionsv1.CustomResourceDefinition

	err = verber.apiExtensionsClient.Get().Resource("customresourcedefinitions").Name(kind).Do(context.TODO()).Into(&crdv1)
	if err != nil {
		if errors.IsNotFoundError(err) {
			return info, errors.NewInvalid(fmt.Sprintf("Unknown resource kind: %s", kind))
		}

		return
	}

	if len(crdv1.Spec.Versions) > 0 {
		info.group = crdv1.Spec.Group
		info.version = crdv1.Spec.Versions[0].Name
		info.pluralName = crdv1.Status.AcceptedNames.Plural
		info.namespaced = crdv1.Spec.Scope == apiextensionsv1.NamespaceScoped

		return
	}

	return
}

// RESTClient is an interface for REST operations used in this file.
type RESTClient interface {
	Delete() *restclient.Request
	Put() *restclient.Request
	Get() *restclient.Request
}

// NewResourceVerber creates a new resource verber that uses the given client for performing operations.
func NewResourceVerber(client, appsClient, batchClient, betaBatchClient, autoscalingClient, storageClient, rbacClient, networkingClient, apiExtensionsClient, pluginsClient RESTClient, config *restclient.Config) clientapi.ResourceVerber {
	return &resourceVerber{client, appsClient,
		batchClient, betaBatchClient, autoscalingClient, storageClient, rbacClient, networkingClient, apiExtensionsClient, pluginsClient, config}
}

// Delete deletes the resource of the given kind in the given namespace with the given name.
func (verber *resourceVerber) Delete(kind string, namespaceSet bool, namespace string, name string) error {
	client, resourceSpec, err := verber.getResourceSpecFromKind(kind, namespaceSet)
	if err != nil {
		return err
	}

	// Do cascade delete by default, as this is what users typically expect.
	defaultPropagationPolicy := v1.DeletePropagationForeground
	defaultDeleteOptions := &v1.DeleteOptions{
		PropagationPolicy: &defaultPropagationPolicy,
	}

	req := client.Delete().Resource(resourceSpec.Resource).Name(name).Body(defaultDeleteOptions)

	if resourceSpec.Namespaced {
		req.Namespace(namespace)
	}

	return req.Do(context.TODO()).Error()
}

// Put puts new resource version of the given kind in the given namespace with the given name.
func (verber *resourceVerber) Put(kind string, namespaceSet bool, namespace string, name string,
	object *runtime.Unknown) error {

	client, resourceSpec, err := verber.getResourceSpecFromKind(kind, namespaceSet)
	if err != nil {
		return err
	}

	req := client.Put().
		Resource(resourceSpec.Resource).
		Name(name).
		SetHeader("Content-Type", "application/json").
		Body([]byte(object.Raw))

	if resourceSpec.Namespaced {
		req.Namespace(namespace)
	}

	return req.Do(context.TODO()).Error()
}

// Get gets the resource of the given kind in the given namespace with the given name.
func (verber *resourceVerber) Get(kind string, namespaceSet bool, namespace string, name string) (runtime.Object, error) {
	client, resourceSpec, err := verber.getResourceSpecFromKind(kind, namespaceSet)
	if err != nil {
		return nil, err
	}

	result := &runtime.Unknown{}
	req := client.Get().Resource(resourceSpec.Resource).Name(name).SetHeader("Accept", "application/json")

	if resourceSpec.Namespaced {
		req.Namespace(namespace)
	}

	err = req.Do(context.TODO()).Into(result)
	return result, err
}
