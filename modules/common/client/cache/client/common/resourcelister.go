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
	"context"
	"fmt"

	authorizationapiv1 "k8s.io/api/authorization/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	authorizationv1 "k8s.io/client-go/kubernetes/typed/authorization/v1"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/client/cache"

	"k8s.io/dashboard/errors"
	"k8s.io/dashboard/types"
)

type ResourceListerInterface[T any] interface {
	List(ctx context.Context, opts metav1.ListOptions) (*T, error)
}

type CachedResourceLister[T any] struct {
	authorizationV1 authorizationv1.AuthorizationV1Interface
	token           string
	ssar            *authorizationapiv1.SelfSubjectAccessReview
}

func (in CachedResourceLister[T]) List(ctx context.Context, lister ResourceListerInterface[T], opts metav1.ListOptions) (*T, error) {
	cacheKey := in.cacheKey(opts)
	cachedList, found, err := cache.Get[T](cacheKey)
	if err != nil {
		return new(T), err
	}
	if !found {
		klog.V(3).InfoS("resource not found in cache, initializing", "kind", in.kind(), "namespace", in.namespace())
		return cache.SyncedLoad(cacheKey, func() (*T, error) {
			return lister.List(ctx, opts)
		})
	}

	review, err := in.authorizationV1.SelfSubjectAccessReviews().Create(ctx, in.selfSubjectAccessReview(types.VerbList), metav1.CreateOptions{})
	if err != nil {
		return new(T), err
	}

	if review.Status.Allowed {
		klog.V(3).InfoS("resource found in cache, updating in background", "kind", in.kind(), "namespace", in.namespace())
		cache.DeferredLoad[*T](cacheKey, func() (*T, error) {
			return lister.List(ctx, opts)
		})
		return cachedList, nil
	}

	return new(T), errors.NewForbidden(
		errors.MsgForbiddenError,
		fmt.Errorf("%s: %s", review.Status.Reason, review.Status.EvaluationError),
	)
}

func (in CachedResourceLister[_]) selfSubjectAccessReview(verb types.Verb) *authorizationapiv1.SelfSubjectAccessReview {
	in.ssar.Spec.ResourceAttributes.Verb = verb.String()
	return in.ssar
}

func (in CachedResourceLister[_]) cacheKey(opts metav1.ListOptions) cache.Key {
	return cache.NewKey(in.kind(), in.namespace(), in.token, opts)
}

func (in CachedResourceLister[T]) ensure() {
	if len(in.token) == 0 {
		panic("token arg is required when creating CachedResourceLister")
	}

	if len(in.ssar.Spec.ResourceAttributes.Resource) == 0 {
		panic("resource kind arg is required when creating CachedResourceLister")
	}
}

func (in CachedResourceLister[_]) namespace() string {
	return in.ssar.Spec.ResourceAttributes.Namespace
}

func (in CachedResourceLister[T]) kind() types.ResourceKind {
	return types.ResourceKind(in.ssar.Spec.ResourceAttributes.Resource)
}

func NewCachedResourceLister[T any](
	authorization authorizationv1.AuthorizationV1Interface,
	options ...Option[T],
) CachedResourceLister[T] {
	result := CachedResourceLister[T]{
		authorizationV1: authorization,
		ssar: &authorizationapiv1.SelfSubjectAccessReview{
			Spec: authorizationapiv1.SelfSubjectAccessReviewSpec{
				ResourceAttributes: &authorizationapiv1.ResourceAttributes{},
			},
		},
	}

	for _, opt := range options {
		opt(&result)
	}

	result.ensure()
	return result
}
