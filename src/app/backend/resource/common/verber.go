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

package common

import (
	"fmt"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/client/restclient"
	"k8s.io/kubernetes/pkg/runtime"
)

// ResourceVerber is a struct responsible for doing common verb operations on resources, like
// DELETE, PUT, UPDATE.
type ResourceVerber struct {
	client            RESTClient
	extensionsClient  RESTClient
	appsClient        RESTClient
	batchClient       RESTClient
	autoscalingClient RESTClient
}

func (verber *ResourceVerber) getRESTClientByType(clientType ClientType) RESTClient {
	switch clientType {
	case ClientTypeExtensionClient:
		return verber.extensionsClient
	case ClientTypeAppsClient:
		return verber.appsClient
	case ClientTypeBatchClient:
		return verber.batchClient
	case ClientTypeAutoscalingClient:
		return verber.autoscalingClient
	default:
		return verber.client
	}
}

// RESTClient is an interface for REST operations used in this file.
type RESTClient interface {
	Delete() *restclient.Request
	Put() *restclient.Request
	Get() *restclient.Request
}

// NewResourceVerber creates a new resource verber that uses the given client for performing
// operations.
func NewResourceVerber(client, extensionsClient, appsClient,
	batchClient, autoscalingClient RESTClient) ResourceVerber {
	return ResourceVerber{client, extensionsClient, appsClient, batchClient, autoscalingClient}
}

// Delete deletes the resource of the given kind in the given namespace with the given name.
func (verber *ResourceVerber) Delete(kind string, namespace string, name string) error {
	resourceSpec, ok := kindToAPIMapping[kind]
	if !ok {
		return fmt.Errorf("Unknown resource kind: %s", kind)
	}

	client := verber.getRESTClientByType(resourceSpec.ClientType)

	// Do cascade delete by default, as this is what users typically expect.
	defaultOrphanDependents := false
	defaultDeleteOptions := &api.DeleteOptions{
		OrphanDependents: &defaultOrphanDependents,
	}

	return client.Delete().
		Namespace(namespace).
		Resource(resourceSpec.Resource).
		Name(name).
		Body(defaultDeleteOptions).
		Do().
		Error()
}

// Put puts new resource version of the given kind in the given namespace with the given name.
func (verber *ResourceVerber) Put(kind string, namespace string, name string,
	object runtime.Object) error {

	resourceSpec, ok := kindToAPIMapping[kind]
	if !ok {
		return fmt.Errorf("Unknown resource kind: %s", kind)
	}

	client := verber.getRESTClientByType(resourceSpec.ClientType)

	return client.Put().
		Namespace(namespace).
		Resource(resourceSpec.Resource).
		Name(name).
		Body(object).
		Do().
		Error()
}

// Get gets the resource of the given kind in the given namespace with the given name.
func (verber *ResourceVerber) Get(kind string, namespace string, name string) (runtime.Object, error) {
	resourceSpec, ok := kindToAPIMapping[kind]
	if !ok {
		return nil, fmt.Errorf("Unknown resource kind: %s", kind)
	}

	client := verber.getRESTClientByType(resourceSpec.ClientType)

	result := &runtime.Unknown{}
	err := client.Get().
		Namespace(namespace).
		Resource(resourceSpec.Resource).
		Name(name).
		Do().
		Into(result)

	return result, err
}
