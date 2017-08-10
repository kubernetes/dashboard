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

package api

import (
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/watch"
)

type ActionHandlerFunction func(runtime.Object)

type Synchronizer interface {
	Name() string
	Start()
	Error() chan error
	Create(runtime.Object) error
	Get() runtime.Object
	Update(runtime.Object) error
	Delete() error
	Refresh()
	RegisterActionHandler(ActionHandlerFunction, ...watch.EventType)
}

type SynchronizerManager interface {
	Secret(namespace, name string) Synchronizer
}
