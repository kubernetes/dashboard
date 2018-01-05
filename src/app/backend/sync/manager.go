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

package sync

import (
	syncApi "github.com/kubernetes/dashboard/src/app/backend/sync/api"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/kubernetes"
)

// Implements SynchronizerManager interface.
type synchronizerManager struct {
	client kubernetes.Interface
}

// Secret implements synchronizer manager. See SynchronizerManager interface for more information.
func (self *synchronizerManager) Secret(namespace, name string) syncApi.Synchronizer {
	return &secretSynchronizer{
		namespace:      namespace,
		name:           name,
		client:         self.client,
		actionHandlers: make(map[watch.EventType][]syncApi.ActionHandlerFunction),
	}
}

// NewSynchronizerManager creates new instance of SynchronizerManager.
func NewSynchronizerManager(client kubernetes.Interface) syncApi.SynchronizerManager {
	return &synchronizerManager{client: client}
}
