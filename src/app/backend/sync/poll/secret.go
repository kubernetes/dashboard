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

package poll

import (
	"time"

	syncapi "github.com/kubernetes/dashboard/src/app/backend/sync/api"
	"k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/wait"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/kubernetes"
)

// SecretPoller implements Poller interface. See Poller for more information.
type SecretPoller struct {
	name      string
	namespace string
	secret    *v1.Secret
	client    kubernetes.Interface
	watcher   *PollWatcher
}

// Poll new secret every 'interval' time and send it to watcher channel. See Poller for more information.
func (self *SecretPoller) Poll(interval time.Duration) watch.Interface {
	stopCh := make(chan struct{})

	go wait.Until(func() {
		if self.watcher.IsStopped() {
			close(stopCh)
			return
		}

		self.watcher.eventChan <- self.getSecretEvent()
	}, interval, stopCh)

	return self.watcher
}

// Gets secret from API server and transforms it to watch.Event object.
func (self *SecretPoller) getSecretEvent() watch.Event {
	secret, err := self.client.CoreV1().Secrets(self.namespace).Get(self.name, metav1.GetOptions{})
	if secret != nil {
		self.secret = secret
	}

	event := watch.Event{
		Object: secret,
		Type:   watch.Added,
	}

	if err != nil {
		event.Type = watch.Error
	}

	if self.isNotFoundError(err) && self.secret != nil {
		event.Type = watch.Deleted
		self.secret = nil
	}

	return event
}

// Checks whether or not given error is a not found error (404).
func (self *SecretPoller) isNotFoundError(err error) bool {
	statusErr, ok := err.(*errors.StatusError)
	if !ok {
		return false
	}
	return statusErr.ErrStatus.Code == 404
}

// NewSecretPoller returns instance of Poller interface.
func NewSecretPoller(name, namespace string, client kubernetes.Interface) syncapi.Poller {
	return &SecretPoller{
		name:      name,
		namespace: namespace,
		client:    client,
		watcher:   NewPollWatcher(),
	}
}
