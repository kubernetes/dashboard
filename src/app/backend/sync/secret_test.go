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
	"testing"
	"time"

	syncApi "github.com/kubernetes/dashboard/src/app/backend/sync/api"
	"k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/util/wait"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/kubernetes/fake"
	k8stest "k8s.io/client-go/testing"
)

// Implements sync api Poller interface
type fakePoller struct {
	watch watch.Interface
}

func (self *fakePoller) Poll(time.Duration) watch.Interface {
	return self.watch
}

// Implements k8s watch Interface
type fakeWatch struct {
	events chan watch.Event
}

func (self *fakeWatch) Stop() {
	close(self.events)
}

func (self *fakeWatch) ResultChan() <-chan watch.Event {
	return self.events
}

func (self *fakeWatch) emitEvent(ev watch.Event) {
	self.events <- ev
}

func getSecretEvent(name, namespace string, eventType watch.EventType) watch.Event {
	return watch.Event{
		Type:   eventType,
		Object: &v1.Secret{ObjectMeta: metaV1.ObjectMeta{Name: name, Namespace: namespace}},
	}
}

type conditionFunc func(obj runtime.Object) bool

var expectNil = func(obj runtime.Object) bool {
	if obj == nil {
		return true
	}

	return false
}

var expectNotNil = func(obj runtime.Object) bool {
	if obj != nil {
		return true
	}

	return false
}

func validateSyncedObject(sync syncApi.Synchronizer, timeout time.Duration, f conditionFunc) bool {
	stopCh := make(chan struct{})
	objCh := make(chan runtime.Object, 1)
	var obj runtime.Object

	// Wait until emitted object is available
	go wait.Until(func() {
		obj = sync.Get()
		if f(obj) {
			objCh <- obj
			close(stopCh)
		}
	}, 0, stopCh)

	// Wait for object. In case it doesn't get synced within "timeout" seconds, return false.
	select {
	case <-objCh:
		return true
	case <-time.After(timeout):
		close(stopCh)
		return false
	}
}

func TestSecretSynchronizer_Start(t *testing.T) {
	fWatch := &fakeWatch{events: make(chan watch.Event)}
	fClient := fake.NewSimpleClientset()

	secretSync := NewSynchronizerManager(fClient).Secret("test-ns", "test-secret")
	secretSync.SetPoller(&fakePoller{watch: fWatch})
	secretSync.Start()

	secret := secretSync.Get()
	if secret != nil {
		t.Fatal("secretSync.Start(): Expected secret to be nil")
	}

	// Emit secret that should be synced and available through Get() method
	fWatch.emitEvent(getSecretEvent("test-secret", "test-ns", watch.Added))
	if !validateSyncedObject(secretSync, 2*time.Second, expectNotNil) {
		t.Fatal("secretSync.Start(): Expected secret not to be nil")
	}
}

func TestSecretSynchronizer_Create(t *testing.T) {
	fWatch := &fakeWatch{events: make(chan watch.Event)}
	fClient := fake.NewSimpleClientset()
	obj := &v1.Secret{ObjectMeta: metaV1.ObjectMeta{Name: "test-secret", Namespace: "test-ns"}}

	fClient.PrependReactor("create", "*",
		func(action k8stest.Action) (handled bool, ret runtime.Object, err error) {
			ev := watch.Event{
				Type:   watch.Added,
				Object: obj,
			}

			fWatch.emitEvent(ev)
			return true, ev.Object, nil
		})

	secretSync := NewSynchronizerManager(fClient).Secret("test-ns", "test-secret")
	secretSync.SetPoller(&fakePoller{watch: fWatch})
	secretSync.Start()

	secret := secretSync.Get()
	if secret != nil {
		t.Fatal("secretSync.Get(): Expected secret to be nil")
	}

	secretSync.Create(obj)

	if !validateSyncedObject(secretSync, 2*time.Second, expectNotNil) {
		t.Fatal("secretSync.Create(): Expected secret not to be nil")
	}
}

func TestSecretSynchronizer_Delete(t *testing.T) {
	fWatch := &fakeWatch{events: make(chan watch.Event)}
	obj := &v1.Secret{ObjectMeta: metaV1.ObjectMeta{Name: "test-secret", Namespace: "test-ns"}}
	fClient := fake.NewSimpleClientset()

	fClient.PrependReactor("delete", "*",
		func(action k8stest.Action) (handled bool, ret runtime.Object, err error) {
			ev := watch.Event{
				Type:   watch.Deleted,
				Object: obj,
			}

			fWatch.emitEvent(ev)
			return true, ev.Object, nil
		})

	secretSync := NewSynchronizerManager(fClient).Secret("test-ns", "test-secret")
	secretSync.SetPoller(&fakePoller{watch: fWatch})
	secretSync.Start()

	// Emit secret that should be synced and available through Get() method
	fWatch.emitEvent(getSecretEvent("test-secret", "test-ns", watch.Added))

	if !validateSyncedObject(secretSync, 2*time.Second, expectNotNil) {
		t.Fatal("secretSync.Start(): Expected secret not to be nil")
	}

	err := secretSync.Delete()
	if err != nil {
		t.Fatal("secretSync.Delete(): Expected secret sync delete not to throw an error")
	}

	if !validateSyncedObject(secretSync, 2*time.Second, expectNil) {
		t.Fatal("secretSync.Start(): Expected secret not to be nil")
	}
}

func TestSecretSynchronizer_Update(t *testing.T) {
	fWatch := &fakeWatch{events: make(chan watch.Event)}
	obj := &v1.Secret{ObjectMeta: metaV1.ObjectMeta{Name: "test-secret", Namespace: "test-ns"},
		Data: map[string][]byte{"test-key": []byte("test-val")}}
	fClient := fake.NewSimpleClientset()

	fClient.PrependReactor("update", "*",
		func(action k8stest.Action) (handled bool, ret runtime.Object, err error) {
			ev := watch.Event{
				Type:   watch.Modified,
				Object: obj,
			}

			fWatch.emitEvent(ev)
			return true, ev.Object, nil
		})

	secretSync := NewSynchronizerManager(fClient).Secret("test-ns", "test-secret")
	secretSync.SetPoller(&fakePoller{watch: fWatch})
	secretSync.Start()

	// Emit secret that should be synced and available through Get() method
	fWatch.emitEvent(getSecretEvent("test-secret", "test-ns", watch.Added))

	if !validateSyncedObject(secretSync, 2*time.Second, expectNotNil) {
		t.Fatal("secretSync.Update(): Expected secret not to be nil")
	}

	err := secretSync.Update(obj)
	if err != nil {
		t.Fatal("secretSync.Update(): Expected secret sync delete not to throw an error")
	}

	if !validateSyncedObject(secretSync, 2*time.Second, func(obj runtime.Object) bool {
		s := obj.(*v1.Secret)
		if _, contains := s.Data["test-key"]; !contains {
			return true
		}

		return false
	}) {
		t.Fatal("secretSync.Update(): Expected secret to be updated")
	}

}

func TestSecretSynchronizer_Error(t *testing.T) {
	fWatch := &fakeWatch{events: make(chan watch.Event)}
	fClient := fake.NewSimpleClientset()
	obj := &v1.Pod{ObjectMeta: metaV1.ObjectMeta{Name: "test-pod", Namespace: "test-ns"}}

	fClient.PrependReactor("create", "*",
		func(action k8stest.Action) (handled bool, ret runtime.Object, err error) {
			ev := watch.Event{
				Type:   watch.Added,
				Object: obj,
			}

			fWatch.emitEvent(ev)
			return true, ev.Object, nil
		})

	secretSync := NewSynchronizerManager(fClient).Secret("test-ns", "test-secret")
	secretSync.SetPoller(&fakePoller{watch: fWatch})
	secretSync.Start()

	secret := secretSync.Get()
	if secret != nil {
		t.Fatal("secretSync.Get(): Expected secret to be nil")
	}

	fWatch.emitEvent(watch.Event{Type: watch.Added, Object: obj})

	select {
	case <-secretSync.Error():
	case <-time.After(2 * time.Second):
		t.Fatal("secretSync.Error(): Expected error to be thrown")
	}
}

func TestSecretSynchronizer_Name(t *testing.T) {
	ns, name := "test-ns", "test-secret"
	secretSync := NewSynchronizerManager(fake.NewSimpleClientset()).Secret(ns, name)
	if secretSync.Name() != name+"-"+ns {
		t.Fatalf("secretSync.Name(): Expected synchronizer name to equal name-namespace but got %s", secretSync.Name())
	}
}

func TestSecretSynchronizer_Refresh(t *testing.T) {
	fWatch := &fakeWatch{events: make(chan watch.Event)}
	fClient := fake.NewSimpleClientset()
	obj := &v1.Secret{ObjectMeta: metaV1.ObjectMeta{Name: "test-pod", Namespace: "test-ns"}}

	fClient.PrependReactor("get", "*",
		func(action k8stest.Action) (handled bool, ret runtime.Object, err error) {
			return true, obj, nil
		})

	secretSync := NewSynchronizerManager(fClient).Secret("test-ns", "test-secret")
	secretSync.SetPoller(&fakePoller{watch: fWatch})
	secretSync.Start()
	secretSync.Refresh()

	if !validateSyncedObject(secretSync, 2*time.Second, expectNotNil) {
		t.Fatal("secretSync.Refresh(): Expected secret not to be nil")
	}
}

func TestSecretSynchronizer_RegisterActionHandler(t *testing.T) {
	fWatch := &fakeWatch{events: make(chan watch.Event)}
	fClient := fake.NewSimpleClientset()
	executedActionHandler := false

	secretSync := NewSynchronizerManager(fClient).Secret("test-ns", "test-secret")
	secretSync.SetPoller(&fakePoller{watch: fWatch})
	secretSync.Start()
	secretSync.RegisterActionHandler(func(obj runtime.Object) {
		executedActionHandler = true
	}, watch.Added)

	fWatch.emitEvent(getSecretEvent("test-secret", "test-ns", watch.Added))

	if !validateSyncedObject(secretSync, 2*time.Second, expectNotNil) {
		t.Fatal("secretSync.Get(): Expected secret not to be nil")
	}

	if !executedActionHandler {
		t.Fatal("secretSync.RegisterActionHandler(): Expected action handler to be executed")
	}
}
