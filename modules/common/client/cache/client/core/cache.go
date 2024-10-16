package core

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
	namespace       string
	token           string
	resourceKind    types.ResourceKind
}

func (in CachedResourceLister[T]) List(ctx context.Context, lister ResourceListerInterface[T], opts metav1.ListOptions) (*T, error) {
	cacheKey := in.cacheKey(opts)
	cachedList, found, err := cache.Get[*T](cacheKey)
	if err != nil {
		return nil, err
	}

	if !found {
		list, err := lister.List(ctx, opts)
		if err != nil {
			return list, err
		}

		klog.V(3).InfoS("resource not found in cache, initializing")
		return list, cache.Set[*T](cacheKey, list)
	}

	review, err := in.authorizationV1.SelfSubjectAccessReviews().Create(ctx, in.selfSubjectAccessReview(), metav1.CreateOptions{})
	if err != nil {
		return nil, err
	}

	if review.Status.Allowed {
		klog.V(3).InfoS("resource found in cache, updating in background")
		cache.DeferredLoad[*T](cacheKey, func() (*T, error) {
			return lister.List(ctx, opts)
		})
		return cachedList, nil
	}

	return nil, errors.NewForbidden(
		errors.MsgForbiddenError,
		fmt.Errorf("%s: %s", review.Status.Reason, review.Status.EvaluationError),
	)
}

func (in CachedResourceLister[_]) selfSubjectAccessReview() *authorizationapiv1.SelfSubjectAccessReview {
	return &authorizationapiv1.SelfSubjectAccessReview{
		Spec: authorizationapiv1.SelfSubjectAccessReviewSpec{
			ResourceAttributes: &authorizationapiv1.ResourceAttributes{
				Namespace: in.namespace,
				Verb:      types.VerbList,
				Resource:  in.resourceKind.String(),
			},
		},
	}
}

func (in CachedResourceLister[_]) cacheKey(opts metav1.ListOptions) cache.Key {
	return cache.NewKey(in.resourceKind, in.namespace, in.token, opts)
}

func NewCachedResourceLister[T any](
	authorization authorizationv1.AuthorizationV1Interface,
	namespace string,
	token string,
	resourceKind types.ResourceKind,
) CachedResourceLister[T] {
	return CachedResourceLister[T]{
		authorizationV1: authorization,
		namespace:       namespace,
		token:           token,
		resourceKind:    resourceKind,
	}
}

func NewCachedClusterScopedResourceLister[T any](
	authorization authorizationv1.AuthorizationV1Interface,
	token string,
	resourceKind types.ResourceKind,
) CachedResourceLister[T] {
	return CachedResourceLister[T]{
		authorizationV1: authorization,
		namespace:       "",
		token:           token,
		resourceKind:    resourceKind,
	}
}
