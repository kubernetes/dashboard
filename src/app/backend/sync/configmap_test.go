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

	"k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/kubernetes/fake"
	k8stest "k8s.io/client-go/testing"
)

func getConfigMapEvent(name, namespace string, eventType watch.EventType) watch.Event {
	return watch.Event{
		Type:   eventType,
		Object: &v1.ConfigMap{ObjectMeta: metaV1.ObjectMeta{Name: name, Namespace: namespace}},
	}
}

func TestConfigMapSynchronizer_Start(t *testing.T) {
	fWatch := &fakeWatch{events: make(chan watch.Event)}
	fClient := fake.NewSimpleClientset()
	fClient.PrependWatchReactor("*",
		func(action k8stest.Action) (handled bool, ret watch.Interface, err error) {
			return true, fWatch, nil
		})

	configMapSync := NewSynchronizerManager(fClient).ConfigMap("test-ns", "test-configMap")
	configMapSync.Start()

	configMap := configMapSync.Get()
	if configMap != nil {
		t.Fatal("configMapSync.Start(): Expected configMap to be nil")
	}

	// Emit configMap that should be synced and available through Get() method
	fWatch.emitEvent(getConfigMapEvent("test-configMap", "test-ns", watch.Added))

	if !validateSyncedObject(configMapSync, 2*time.Second, expectNotNil) {
		t.Fatal("configMapSync.Start(): Expected configMap not to be nil")
	}
}

func TestConfigMapSynchronizer_Create(t *testing.T) {
	fWatch := &fakeWatch{events: make(chan watch.Event)}
	fClient := fake.NewSimpleClientset()
	obj := &v1.ConfigMap{ObjectMeta: metaV1.ObjectMeta{Name: "test-configMap", Namespace: "test-ns"}}

	fClient.PrependWatchReactor("*",
		func(action k8stest.Action) (handled bool, ret watch.Interface, err error) {
			return true, fWatch, nil
		})

	fClient.PrependReactor("create", "*",
		func(action k8stest.Action) (handled bool, ret runtime.Object, err error) {
			ev := watch.Event{
				Type:   watch.Added,
				Object: obj,
			}

			fWatch.emitEvent(ev)
			return true, ev.Object, nil
		})

	configMapSync := NewSynchronizerManager(fClient).ConfigMap("test-ns", "test-configMap")
	configMapSync.Start()

	configMap := configMapSync.Get()
	if configMap != nil {
		t.Fatal("configMapSync.Get(): Expected configMap to be nil")
	}

	configMapSync.Create(obj)

	if !validateSyncedObject(configMapSync, 2*time.Second, expectNotNil) {
		t.Fatal("configMapSync.Create(): Expected configMap not to be nil")
	}
}

func TestConfigMapSynchronizer_Delete(t *testing.T) {
	fWatch := &fakeWatch{events: make(chan watch.Event)}
	obj := &v1.ConfigMap{ObjectMeta: metaV1.ObjectMeta{Name: "test-configMap", Namespace: "test-ns"}}
	fClient := fake.NewSimpleClientset()

	fClient.PrependWatchReactor("*",
		func(action k8stest.Action) (handled bool, ret watch.Interface, err error) {
			return true, fWatch, nil
		})

	fClient.PrependReactor("delete", "*",
		func(action k8stest.Action) (handled bool, ret runtime.Object, err error) {
			ev := watch.Event{
				Type:   watch.Deleted,
				Object: obj,
			}

			fWatch.emitEvent(ev)
			return true, ev.Object, nil
		})

	configMapSync := NewSynchronizerManager(fClient).ConfigMap("test-ns", "test-configMap")
	configMapSync.Start()

	// Emit configMap that should be synced and available through Get() method
	fWatch.emitEvent(getConfigMapEvent("test-configMap", "test-ns", watch.Added))

	if !validateSyncedObject(configMapSync, 2*time.Second, expectNotNil) {
		t.Fatal("configMapSync.Start(): Expected configMap not to be nil")
	}

	err := configMapSync.Delete()
	if err != nil {
		t.Fatal("configMapSync.Delete(): Expected configMap sync delete not to throw an error")
	}

	if !validateSyncedObject(configMapSync, 2*time.Second, expectNil) {
		t.Fatal("configMapSync.Start(): Expected configMap not to be nil")
	}
}

func TestConfigMapSynchronizer_Update(t *testing.T) {
	fWatch := &fakeWatch{events: make(chan watch.Event)}
	obj := &v1.ConfigMap{ObjectMeta: metaV1.ObjectMeta{Name: "test-configMap", Namespace: "test-ns"},
		Data: map[string]string{"test-key": "test-val"}}
	fClient := fake.NewSimpleClientset()

	fClient.PrependWatchReactor("*",
		func(action k8stest.Action) (handled bool, ret watch.Interface, err error) {
			return true, fWatch, nil
		})

	fClient.PrependReactor("update", "*",
		func(action k8stest.Action) (handled bool, ret runtime.Object, err error) {
			ev := watch.Event{
				Type:   watch.Modified,
				Object: obj,
			}

			fWatch.emitEvent(ev)
			return true, ev.Object, nil
		})

	configMapSync := NewSynchronizerManager(fClient).ConfigMap("test-ns", "test-configMap")
	configMapSync.Start()

	// Emit configMap that should be synced and available through Get() method
	fWatch.emitEvent(getConfigMapEvent("test-configMap", "test-ns", watch.Added))

	if !validateSyncedObject(configMapSync, 2*time.Second, expectNotNil) {
		t.Fatal("configMapSync.Update(): Expected configMap not to be nil")
	}

	err := configMapSync.Update(obj)
	if err != nil {
		t.Fatal("configMapSync.Update(): Expected configMap sync delete not to throw an error")
	}

	if !validateSyncedObject(configMapSync, 2*time.Second, func(obj runtime.Object) bool {
		s := obj.(*v1.ConfigMap)
		if _, contains := s.Data["test-key"]; !contains {
			return true
		}

		return false
	}) {
		t.Fatal("configMapSync.Update(): Expected configMap to be updated")
	}

}

func TestConfigMapSynchronizer_Error(t *testing.T) {
	fWatch := &fakeWatch{events: make(chan watch.Event)}
	fClient := fake.NewSimpleClientset()
	obj := &v1.Pod{ObjectMeta: metaV1.ObjectMeta{Name: "test-pod", Namespace: "test-ns"}}

	fClient.PrependWatchReactor("*",
		func(action k8stest.Action) (handled bool, ret watch.Interface, err error) {
			return true, fWatch, nil
		})

	fClient.PrependReactor("create", "*",
		func(action k8stest.Action) (handled bool, ret runtime.Object, err error) {
			ev := watch.Event{
				Type:   watch.Added,
				Object: obj,
			}

			fWatch.emitEvent(ev)
			return true, ev.Object, nil
		})

	configMapSync := NewSynchronizerManager(fClient).ConfigMap("test-ns", "test-configMap")
	configMapSync.Start()

	configMap := configMapSync.Get()
	if configMap != nil {
		t.Fatal("configMapSync.Get(): Expected configMap to be nil")
	}

	fWatch.emitEvent(watch.Event{Type: watch.Added, Object: obj})

	select {
	case <-configMapSync.Error():
	case <-time.After(2 * time.Second):
		t.Fatal("configMapSync.Error(): Expected error to be thrown")
	}
}

func TestConfigMapSynchronizer_Name(t *testing.T) {
	ns, name := "test-ns", "test-configMap"
	configMapSync := NewSynchronizerManager(fake.NewSimpleClientset()).ConfigMap(ns, name)
	if configMapSync.Name() != name+"-"+ns {
		t.Fatalf("configMapSync.Name(): Expected synchronizer name to equal name-namespace but got %s", configMapSync.Name())
	}
}

func TestConfigMapSynchronizer_Refresh(t *testing.T) {
	fWatch := &fakeWatch{events: make(chan watch.Event)}
	fClient := fake.NewSimpleClientset()
	obj := &v1.ConfigMap{ObjectMeta: metaV1.ObjectMeta{Name: "test-pod", Namespace: "test-ns"}}

	fClient.PrependWatchReactor("*",
		func(action k8stest.Action) (handled bool, ret watch.Interface, err error) {
			return true, fWatch, nil
		})

	fClient.PrependReactor("get", "*",
		func(action k8stest.Action) (handled bool, ret runtime.Object, err error) {
			return true, obj, nil
		})

	configMapSync := NewSynchronizerManager(fClient).ConfigMap("test-ns", "test-configMap")
	configMapSync.Start()
	configMapSync.Refresh()

	if !validateSyncedObject(configMapSync, 2*time.Second, expectNotNil) {
		t.Fatal("configMapSync.Refresh(): Expected configMap not to be nil")
	}
}

func TestConfigMapSynchronizer_RegisterActionHandler(t *testing.T) {
	fWatch := &fakeWatch{events: make(chan watch.Event)}
	fClient := fake.NewSimpleClientset()
	executedActionHandler := false

	fClient.PrependWatchReactor("*",
		func(action k8stest.Action) (handled bool, ret watch.Interface, err error) {
			return true, fWatch, nil
		})

	configMapSync := NewSynchronizerManager(fClient).ConfigMap("test-ns", "test-configMap")
	configMapSync.Start()
	configMapSync.RegisterActionHandler(func(obj runtime.Object) {
		executedActionHandler = true
	}, watch.Added)

	fWatch.emitEvent(getConfigMapEvent("test-configMap", "test-ns", watch.Added))

	if !validateSyncedObject(configMapSync, 2*time.Second, expectNotNil) {
		t.Fatal("configMapSync.Get(): Expected configMap not to be nil")
	}

	if !executedActionHandler {
		t.Fatal("configMapSync.RegisterActionHandler(): Expected action handler to be executed")
	}
}
