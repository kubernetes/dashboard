// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package common

import (
	"strings"

	"github.com/gobuffalo/flect"

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
		lister.ssar.Spec.ResourceAttributes.Resource = flect.Pluralize(strings.ToLower(kind.String()))
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
