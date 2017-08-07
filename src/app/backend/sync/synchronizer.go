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

package sync

import "k8s.io/client-go/kubernetes"

type Synchronizer interface {
	Secret(namespace, name string) *SecretSynchronizer
}

type synchronizer struct {
	client kubernetes.Interface
}

func (self *synchronizer) Secret(namespace, name string) *SecretSynchronizer {
	return &SecretSynchronizer{
		namespace: namespace,
		name: name,
		client: self.client,
	}
}

func NewSynchronizer(client kubernetes.Interface) Synchronizer {
	return &synchronizer{client: client}
}