package common

import (
	"k8s.io/dashboard/types"
)

type Option[T any] func(*CachedResourceLister[T])

func WithNamespace[T any](namespace string) Option[T] {
	return func(lister *CachedResourceLister[T]) {
		lister.ssar.Spec.ResourceAttributes.Namespace = namespace
	}
}

func WithResourceKind[T any](kind types.ResourceKind) Option[T] {
	return func(lister *CachedResourceLister[T]) {
		lister.ssar.Spec.ResourceAttributes.Resource = kind.String()
	}
}

func WithGroup[T any](group string) Option[T] {
	return func(lister *CachedResourceLister[T]) {
		lister.ssar.Spec.ResourceAttributes.Group = group
	}
}

func WithVersion[T any](version string) Option[T] {
	return func(lister *CachedResourceLister[T]) {
		lister.ssar.Spec.ResourceAttributes.Version = version
	}
}

func WithToken[T any](token string) Option[T] {
	return func(lister *CachedResourceLister[T]) {
		lister.token = token
	}
}
