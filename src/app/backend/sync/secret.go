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
	"time"

	syncApi "github.com/kubernetes/dashboard/src/app/backend/sync/api"
	"github.com/kubernetes/dashboard/src/app/backend/sync/poll"
	"k8s.io/api/core/v1"
	k8sErrors "k8s.io/apimachinery/pkg/api/errors"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/kubernetes"
)

// Time interval between which secret should be resynchronized.
const secretSyncPeriod = 5 * time.Minute

// Implements Synchronizer interface. See Synchronizer for more information.
type secretSynchronizer struct {
	namespace string
	name      string

	secret         *v1.Secret
	client         kubernetes.Interface
	actionHandlers map[watch.EventType][]syncApi.ActionHandlerFunction
	errChan        chan error
	poller         syncApi.Poller

	mux sync.Mutex
}

// Name implements Synchronizer interface. See Synchronizer for more information.
func (self *secretSynchronizer) Name() string {
	return fmt.Sprintf("%s-%s", self.name, self.namespace)
}

// Start implements Synchronizer interface. See Synchronizer for more information.
func (self *secretSynchronizer) Start() {
	self.errChan = make(chan error)
	watcher, err := self.watch(self.namespace, self.name)
	if err != nil {
		self.errChan <- err
		close(self.errChan)
		return
	}

	go func() {
		log.Printf("Starting secret synchronizer for %s in namespace %s", self.name, self.namespace)
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
func (self *secretSynchronizer) Error() chan error {
	return self.errChan
}

// Create implements Synchronizer interface. See Synchronizer for more information.
func (self *secretSynchronizer) Create(obj runtime.Object) error {
	secret := self.getSecret(obj)
	_, err := self.client.CoreV1().Secrets(secret.Namespace).Create(secret)
	if err != nil {
		return err
	}

	return nil
}

// Get implements Synchronizer interface. See Synchronizer for more information.
func (self *secretSynchronizer) Get() runtime.Object {
	self.mux.Lock()
	defer self.mux.Unlock()

	if self.secret == nil {
		// In case secret was not yet initialized try to do it synchronously
		secret, err := self.client.CoreV1().Secrets(self.namespace).Get(self.name, metaV1.GetOptions{})
		if err != nil {
			return nil
		}

		log.Printf("Initializing secret synchronizer synchronously using secret %s from namespace %s", self.name,
			self.namespace)
		self.secret = secret
	}

	return self.secret
}

// Update implements Synchronizer interface. See Synchronizer for more information.
func (self *secretSynchronizer) Update(obj runtime.Object) error {
	secret := self.getSecret(obj)
	_, err := self.client.CoreV1().Secrets(secret.Namespace).Update(secret)
	if err != nil {
		return err
	}

	return nil
}

// Delete implements Synchronizer interface. See Synchronizer for more information.
func (self *secretSynchronizer) Delete() error {
	return self.client.CoreV1().Secrets(self.namespace).Delete(self.name,
		&metaV1.DeleteOptions{GracePeriodSeconds: new(int64)})
}

// RegisterActionHandler implements Synchronizer interface. See Synchronizer for more information.
func (self *secretSynchronizer) RegisterActionHandler(handler syncApi.ActionHandlerFunction, events ...watch.EventType) {
	for _, ev := range events {
		if _, exists := self.actionHandlers[ev]; !exists {
			self.actionHandlers[ev] = make([]syncApi.ActionHandlerFunction, 0)
		}

		self.actionHandlers[ev] = append(self.actionHandlers[ev], handler)
	}
}

// Refresh implements Synchronizer interface. See Synchronizer for more information.
func (self *secretSynchronizer) Refresh() {
	self.mux.Lock()
	defer self.mux.Unlock()

	secret, err := self.client.CoreV1().Secrets(self.namespace).Get(self.name, metaV1.GetOptions{})
	if err != nil {
		log.Printf("Secret synchronizer %s failed to refresh secret", self.Name())
		return
	}

	self.secret = secret
}

// SetPoller implements Synchronizer interface. See Synchronizer for more information.
func (self *secretSynchronizer) SetPoller(poller syncApi.Poller) {
	self.poller = poller
}

func (self *secretSynchronizer) getSecret(obj runtime.Object) *v1.Secret {
	secret, ok := obj.(*v1.Secret)
	if !ok {
		panic("Provided object has to be a secret. Most likely this is a programming error")
	}

	return secret
}

func (self *secretSynchronizer) watch(namespace, name string) (watch.Interface, error) {
	if self.poller == nil {
		self.poller = poll.NewSecretPoller(name, namespace, self.client)
	}

	return self.poller.Poll(secretSyncPeriod), nil
}

func (self *secretSynchronizer) handleEvent(event watch.Event) error {
	for _, handler := range self.actionHandlers[event.Type] {
		handler(event.Object)
	}

	switch event.Type {
	case watch.Added:
		secret, ok := event.Object.(*v1.Secret)
		if !ok {
			return errors.New(fmt.Sprintf("Expected secret got %s", reflect.TypeOf(event.Object)))
		}

		self.update(*secret)
	case watch.Modified:
		secret, ok := event.Object.(*v1.Secret)
		if !ok {
			return errors.New(fmt.Sprintf("Expected secret got %s", reflect.TypeOf(event.Object)))
		}

		self.update(*secret)
	case watch.Deleted:
		self.mux.Lock()
		self.secret = nil
		self.mux.Unlock()
	case watch.Error:
		return &k8sErrors.UnexpectedObjectError{Object: event.Object}
	}

	return nil
}

func (self *secretSynchronizer) update(secret v1.Secret) {
	if reflect.DeepEqual(self.secret, &secret) {
		// Skip update if existing object is the same as new one
		return
	}

	self.mux.Lock()
	self.secret = &secret
	self.mux.Unlock()
}
