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
	"errors"
	"fmt"
	"log"
	"reflect"
	"sync"

	syncApi "github.com/kubernetes/dashboard/src/app/backend/sync/api"
	"k8s.io/api/core/v1"
	k8sErrors "k8s.io/apimachinery/pkg/api/errors"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/fields"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/kubernetes"
)

// Implements Synchronizer interface. See Synchronizer for more information.
type configMapSynchronizer struct {
	namespace string
	name      string

	configMap      *v1.ConfigMap
	client         kubernetes.Interface
	actionHandlers map[watch.EventType][]syncApi.ActionHandlerFunction
	errChan        chan error

	mux sync.Mutex
}

// Name implements Synchronizer interface. See Synchronizer for more information.
func (self *configMapSynchronizer) Name() string {
	return fmt.Sprintf("%s-%s", self.name, self.namespace)
}

// Start implements Synchronizer interface. See Synchronizer for more information.
func (self *configMapSynchronizer) Start() {
	self.errChan = make(chan error)
	watcher, err := self.watch(self.namespace, self.name)
	if err != nil {
		self.errChan <- err
		close(self.errChan)
		return
	}

	go func() {
		log.Printf("Starting config map synchronizer for %s in namespace %s", self.name, self.namespace)
		defer watcher.Stop()
		defer close(self.errChan)
		for {
			select {
			case ev, ok := <-watcher.ResultChan():
				if !ok {
					self.errChan <- fmt.Errorf("%s watch ended with timeout", self.Name())
					return
				}
				if err := self.handleEvent(ev); err != nil {
					self.errChan <- err
					return
				}
			}
		}
	}()
}

// Error implements Synchronizer interface. See Synchronizer for more information.
func (self *configMapSynchronizer) Error() chan error {
	return self.errChan
}

// Create implements Synchronizer interface. See Synchronizer for more information.
func (self *configMapSynchronizer) Create(obj runtime.Object) error {
	configMap := self.getConfigMap(obj)
	_, err := self.client.CoreV1().ConfigMaps(configMap.Namespace).Create(configMap)
	if err != nil {
		return err
	}

	return nil
}

// Get implements Synchronizer interface. See Synchronizer for more information.
func (self *configMapSynchronizer) Get() runtime.Object {
	self.mux.Lock()
	defer self.mux.Unlock()

	if self.configMap == nil {
		// In case configMap was not yet initialized try to do it synchronously
		configMap, err := self.client.CoreV1().ConfigMaps(self.namespace).Get(self.name, metaV1.GetOptions{})
		if err != nil {
			return nil
		}

		log.Printf("Initializing config map synchronizer synchronously using configMap %s from namespace %s",
			self.name, self.namespace)
		self.configMap = configMap
	}

	return self.configMap
}

// Update implements Synchronizer interface. See Synchronizer for more information.
func (self *configMapSynchronizer) Update(obj runtime.Object) error {
	configMap := self.getConfigMap(obj)
	_, err := self.client.CoreV1().ConfigMaps(configMap.Namespace).Update(configMap)
	return err
}

// Delete implements Synchronizer interface. See Synchronizer for more information.
func (self *configMapSynchronizer) Delete() error {
	return self.client.CoreV1().ConfigMaps(self.namespace).Delete(self.name,
		&metaV1.DeleteOptions{GracePeriodSeconds: new(int64)})
}

// RegisterActionHandler implements Synchronizer interface. See Synchronizer for more information.
func (self *configMapSynchronizer) RegisterActionHandler(handler syncApi.ActionHandlerFunction,
	events ...watch.EventType) {
	for _, ev := range events {
		if _, exists := self.actionHandlers[ev]; !exists {
			self.actionHandlers[ev] = make([]syncApi.ActionHandlerFunction, 0)
		}

		self.actionHandlers[ev] = append(self.actionHandlers[ev], handler)
	}
}

// Refresh implements Synchronizer interface. See Synchronizer for more information.
func (self *configMapSynchronizer) Refresh() {
	self.mux.Lock()
	defer self.mux.Unlock()

	configMap, err := self.client.CoreV1().ConfigMaps(self.namespace).Get(self.name, metaV1.GetOptions{})
	if err != nil {
		log.Printf("Config map synchronizer %s failed to refresh config map", self.Name())
		return
	}

	self.configMap = configMap
}

func (self *configMapSynchronizer) getConfigMap(obj runtime.Object) *v1.ConfigMap {
	configMap, ok := obj.(*v1.ConfigMap)
	if !ok {
		panic("Provided object has to be a config map. Most likely this is a programming error")
	}

	return configMap
}

func (self *configMapSynchronizer) watch(namespace, name string) (watch.Interface, error) {
	selector, err := fields.ParseSelector(fmt.Sprintf("metadata.name=%s", name))
	if err != nil {
		return nil, err
	}

	return self.client.CoreV1().ConfigMaps(namespace).Watch(metaV1.ListOptions{
		FieldSelector: selector.String(),
		Watch:         true,
	})
}

func (self *configMapSynchronizer) handleEvent(event watch.Event) error {
	for _, handler := range self.actionHandlers[event.Type] {
		handler(event.Object)
	}

	switch event.Type {
	case watch.Added:
		configMap, ok := event.Object.(*v1.ConfigMap)
		if !ok {
			return errors.New(fmt.Sprintf("Expected config map got %s", reflect.TypeOf(event.Object)))
		}

		self.update(*configMap)
	case watch.Modified:
		configMap, ok := event.Object.(*v1.ConfigMap)
		if !ok {
			return errors.New(fmt.Sprintf("Expected config map got %s", reflect.TypeOf(event.Object)))
		}

		self.update(*configMap)
	case watch.Deleted:
		self.mux.Lock()
		self.configMap = nil
		self.mux.Unlock()
	case watch.Error:
		return &k8sErrors.UnexpectedObjectError{Object: event.Object}
	}

	return nil
}

func (self *configMapSynchronizer) update(configMap v1.ConfigMap) {
	if reflect.DeepEqual(self.configMap, &configMap) {
		// Skip update if existing object is the same as new one
		log.Print("Trying to update config map with same object. Skipping")
		return
	}

	self.mux.Lock()
	self.configMap = &configMap
	self.mux.Unlock()
}
