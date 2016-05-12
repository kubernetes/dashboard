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
	"errors"
	"fmt"

	"k8s.io/kubernetes/pkg/client/restclient"
)

// ResourceVerber is a struct responsible for doing common verb operations on resources, like
// DELETE, PUT, UPDATE.
type ResourceVerber struct {
	client RESTClient
}

type RESTClient interface {
	Delete() *restclient.Request
}

// NewResourceVerber creates a new resource verber that uses the given client for performing
// operations.
func NewResourceVerber(client RESTClient) ResourceVerber {
	return ResourceVerber{client}
}

// Delete deletes the resource of the given kind in the given namespace with the given name.
func (verber *ResourceVerber) Delete(kind string, namespace string, name string) error {
	apiPath, ok := kindToAPIPathMapping[kind]
	if !ok {
		return errors.New(fmt.Sprintf("Unknown resource kind: %s", kind))
	}

	return verber.client.Delete().
		Namespace(namespace).
		Resource(apiPath).
		Name(name).
		Do().
		Error()
}
