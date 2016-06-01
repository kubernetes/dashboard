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

	"k8s.io/kubernetes/pkg/client/restclient"
)

// ResourceVerber is a struct responsible for doing common verb operations on resources, like
// DELETE, PUT, UPDATE.
type ResourceVerber struct {
	client           RESTClient
	extensionsClient RESTClient
	appsClient       RESTClient
}

// RESTClient is an interface for REST operations used in this file.
type RESTClient interface {
	Delete() *restclient.Request
}

// NewResourceVerber creates a new resource verber that uses the given client for performing
// operations.
func NewResourceVerber(client, extensionsClient, appsClient RESTClient) ResourceVerber {
	return ResourceVerber{client, extensionsClient, appsClient}
}

// Delete deletes the resource of the given kind in the given namespace with the given name.
func (verber *ResourceVerber) Delete(kind string, namespace string, name string) error {
	resourceSpec, ok := kindToAPIMapping[kind]
	if !ok {
		return fmt.Errorf("Unknown resource kind: %s", kind)
	}

	var client RESTClient
	switch resourceSpec.ClientType {
	case ClientTypeDefault:
		client = verber.client
	case ClientTypeExtensionClient:
		client = verber.extensionsClient
	case ClientTypeAppsClient:
		client = verber.appsClient
	default:
		client = verber.client
	}

	return client.Delete().
		Namespace(namespace).
		Resource(resourceSpec.Resource).
		Name(name).
		Do().
		Error()
}
