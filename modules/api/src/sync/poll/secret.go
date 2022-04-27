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
	"context"
	"time"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/wait"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/kubernetes"

	"github.com/kubernetes/dashboard/src/app/backend/errors"
	syncapi "github.com/kubernetes/dashboard/src/app/backend/sync/api"
)

// SecretPoller implements Poller interface. See Poller for more information.
type SecretPoller struct {
	name      string
	namespace string
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
func (self *SecretPoller) getSecretEvent() (event watch.Event) {
	secret, err := self.client.CoreV1().Secrets(self.namespace).Get(context.TODO(), self.name, metav1.GetOptions{})
	event = watch.Event{
		Object: secret,
		Type:   watch.Added,
	}

	if err != nil {
		event.Type = watch.Error
	}

	// In case it was never created we can still mark it as deleted and let secret be recreated.
	if errors.IsNotFoundError(err) {
		event.Type = watch.Deleted
	}

	return
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
