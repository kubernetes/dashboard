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

import (
	"errors"
	"fmt"
	"log"
	"reflect"
	"sync"

	k8sErrors "k8s.io/apimachinery/pkg/api/errors"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/fields"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/pkg/api/v1"
)

type onSecretUpdateFn func(v1.Secret)

type SecretSynchronizer struct {
	namespace string
	name      string

	secret         *v1.Secret
	client         kubernetes.Interface
	onSecretUpdate onSecretUpdateFn
	errChan        chan error

	mux sync.Mutex
}

func (self *SecretSynchronizer) Start() error {
	watcher, err := self.watch(self.namespace, self.name)
	if err != nil {
		return err
	}

	go func() {
		log.Printf("Watching on %s secret in namespace %s", self.name, self.namespace)
		defer watcher.Stop()
		defer close(self.errChan)
		for {
			select {
			case ev := <-watcher.ResultChan():
				if err := self.handleEvent(ev); err != nil {
					self.errChan <- err
					return
				}
			}
		}
	}()

	for err := range self.errChan {
		return err
	}

	return nil
}

func (self *SecretSynchronizer) Update(secret v1.Secret) error {
	_, err := self.client.CoreV1().Secrets(secret.Namespace).Update(&secret)
	if err != nil {
		return err
	}

	return nil
}

func (self *SecretSynchronizer) Create(secret v1.Secret) error {
	_, err := self.client.CoreV1().Secrets(secret.Namespace).Create(&secret)
	if err != nil {
		return err
	}

	return nil
}

func (self *SecretSynchronizer) RegisterOnUpdateHandler(fn onSecretUpdateFn) {
	self.onSecretUpdate = fn
}

func (self *SecretSynchronizer) watch(namespace, name string) (watch.Interface, error) {
	selector, err := fields.ParseSelector(fmt.Sprintf("metadata.name=%s", name))
	if err != nil {
		return nil, err
	}

	return self.client.CoreV1().Secrets(namespace).Watch(metaV1.ListOptions{
		FieldSelector: selector.String(),
		Watch:         true,
	})
}

func (self *SecretSynchronizer) Get() *v1.Secret {
	self.mux.Lock()
	defer self.mux.Unlock()
	return self.secret
}

func (self *SecretSynchronizer) handleEvent(event watch.Event) error {
	switch event.Type {
	case watch.Added:
		secret, ok := event.Object.(*v1.Secret)
		if !ok {
			return errors.New("Not a secret")
		}

		self.update(*secret)
	case watch.Modified:
		secret, ok := event.Object.(*v1.Secret)
		if !ok {
			return errors.New("Not a secret")
		}

		self.update(*secret)
	case watch.Deleted:
		// Should be recreated
		return errors.New("Critical error")
	case watch.Error:
		return &k8sErrors.UnexpectedObjectError{Object: event.Object}
	}

	return nil
}

func (self *SecretSynchronizer) update(secret v1.Secret) {
	if reflect.DeepEqual(self.secret, &secret) {
		// Skip update if existing object is the same as new one
		return
	}

	if self.onSecretUpdate != nil {
		self.onSecretUpdate(secret)
	}

	self.mux.Lock()
	self.secret = &secret
	self.mux.Unlock()
}
