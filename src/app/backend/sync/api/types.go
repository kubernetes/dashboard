package api

import (
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/watch"
)

type ActionHandlerFunction func(runtime.Object)

type Synchronizer interface {
	Start() error
	Update(runtime.Object) error
	Create(runtime.Object) error
	Get() runtime.Object
	RegisterActionHandler(ActionHandlerFunction, ...watch.EventType)
}

type SynchronizerManager interface {
	Secret(namespace, name string) Synchronizer
}
