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
	"net/http"

	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	restclient "k8s.io/client-go/rest"

	"k8s.io/dashboard/errors"
	"k8s.io/dashboard/types"
)

// restClient is an interface for REST operations used in this file.
type restClient interface {
	Delete() *restclient.Request
	Put() *restclient.Request
	Get() *restclient.Request
}

type crdInfo struct {
	version    string
	group      string
	pluralName string
	namespaced bool
}

// resourceVerber is a struct responsible for doing common verb operations on resources, like
// DELETE, PUT, UPDATE.
type resourceVerber struct {
	client              restClient
	appsClient          restClient
	batchClient         restClient
	autoscalingClient   restClient
	storageClient       restClient
	rbacClient          restClient
	networkingClient    restClient
	apiExtensionsClient restClient
	config              *restclient.Config
}

func (verber *resourceVerber) getRESTClientByType(clientType types.ClientType) restClient {
	switch clientType {
	case types.ClientTypeAppsClient:
		return verber.appsClient
	case types.ClientTypeBatchClient:
		return verber.batchClient
	case types.ClientTypeAutoscalingClient:
		return verber.autoscalingClient
	case types.ClientTypeStorageClient:
		return verber.storageClient
	case types.ClientTypeRbacClient:
		return verber.rbacClient
	case types.ClientTypeNetworkingClient:
		return verber.networkingClient
	case types.ClientTypeAPIExtensionsClient:
		return verber.apiExtensionsClient
	default:
		return verber.client
	}
}

func (verber *resourceVerber) getResourceSpecFromKind(kind string, namespaceSet bool) (client restClient, resourceSpec types.APIMapping, err error) {
	resourceSpec, ok := types.APIMappingByKind(types.ResourceKind(kind))
	if !ok {
		var crdInfo crdInfo

		// check if kind is CRD
		crdInfo, err = verber.getCRDGroupAndVersion(kind)
		if err != nil {
			return
		}

		client, err = RESTClient(verber.config, crdInfo.group, crdInfo.version)
		if err != nil {
			return
		}

		resourceSpec = types.APIMapping{
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
		if errors.IsNotFound(err) {
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

// Delete deletes the resource of the given kind in the given namespace with the given name.
func (verber *resourceVerber) Delete(kind string, namespaceSet bool, namespace string, name string, deleteNow bool) error {
	client, resourceSpec, err := verber.getResourceSpecFromKind(kind, namespaceSet)
	if err != nil {
		return err
	}

	// Do cascade delete by default, as this is what users typically expect.
	defaultPropagationPolicy := v1.DeletePropagationForeground
	defaultDeleteOptions := &v1.DeleteOptions{
		PropagationPolicy: &defaultPropagationPolicy,
	}

	if deleteNow {
		gracePeriodSeconds := int64(1)
		defaultDeleteOptions.GracePeriodSeconds = &gracePeriodSeconds
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
		Body(object.Raw)

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

func VerberClient(request *http.Request) (ResourceVerber, error) {
	k8sClient, err := clientFromRequest(request)
	if err != nil {
		return nil, err
	}

	config, err := configFromRequest(request)
	if err != nil {
		return nil, err
	}

	extensionsClient, err := APIExtensionsClient(request)
	if err != nil {
		return nil, err
	}

	return &resourceVerber{
		k8sClient.CoreV1().RESTClient(),
		k8sClient.AppsV1().RESTClient(),
		k8sClient.BatchV1().RESTClient(),
		k8sClient.AutoscalingV1().RESTClient(),
		k8sClient.StorageV1().RESTClient(),
		k8sClient.RbacV1().RESTClient(),
		k8sClient.NetworkingV1().RESTClient(),
		extensionsClient.ApiextensionsV1().RESTClient(),
		config}, nil
}
