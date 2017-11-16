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

package poll_test

import (
	"testing"
	"time"

	"github.com/kubernetes/dashboard/src/app/backend/sync/poll"
	"k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/kubernetes/fake"
)

func TestNewSecretPoller(t *testing.T) {
	poller := poll.NewSecretPoller("test-secret", "test-ns", nil)

	if poller == nil {
		t.Fatal("Expected poller not to be nil.")
	}
}

func TestNewSecretPoller_Poll(t *testing.T) {
	var watchEvent *watch.Event
	sName := "test-secret"
	nsName := "test-ns"
	event := &v1.Event{
		ObjectMeta: metav1.ObjectMeta{
			Namespace: nsName,
			Name:      sName,
		},
	}
	client := fake.NewSimpleClientset(event)
	poller := poll.NewSecretPoller(sName, nsName, client)

	watcher := poller.Poll(1 * time.Second)
	select {
	case ev := <-watcher.ResultChan():
		watchEvent = &ev
	case <-time.After(3 * time.Second):
		t.Fatal("Timeout while waiting for watcher data.")
	}

	if watchEvent == nil {
		t.Fatal("Expected watchEvent not to be nil.")
	}
}
