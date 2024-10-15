package core

import (
	"context"
	"fmt"

	authorizationapiv1 "k8s.io/api/authorization/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	authorizationv1 "k8s.io/client-go/kubernetes/typed/authorization/v1"
	v1 "k8s.io/client-go/kubernetes/typed/core/v1"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/client/cache"
	"k8s.io/dashboard/errors"
	"k8s.io/dashboard/types"
)

type pods struct {
	v1.PodInterface

	authorizationV1 authorizationv1.AuthorizationV1Interface
	namespace       string
	token           string
}

func (in *pods) List(ctx context.Context, opts metav1.ListOptions) (*corev1.PodList, error) {
	cacheKey := in.cacheKey(opts)

	cachedList, found, err := cache.Get[*corev1.PodList](cacheKey)
	if err != nil {
		return nil, err
	}

	if !found {
		list, err := in.PodInterface.List(ctx, opts)
		if err != nil {
			return list, err
		}

		klog.V(3).InfoS("pods not found in cache, initializing", "cache-key", cacheKey)
		return list, cache.Set[*corev1.PodList](cacheKey, list)
	}

	review, err := in.authorizationV1.SelfSubjectAccessReviews().Create(ctx, in.selfSubjectAccessReview(), metav1.CreateOptions{})
	if err != nil {
		return nil, err
	}

	if review.Status.Allowed {
		klog.V(3).InfoS("pods found in cache, updating in background", "cache-key", cacheKey)
		cache.DeferredLoad[*corev1.PodList](cacheKey, func() (*corev1.PodList, error) {
			return in.PodInterface.List(ctx, opts)
		})
		return cachedList, nil
	}

	return nil, errors.NewForbidden(
		errors.MsgForbiddenError,
		fmt.Errorf("%s: %s", review.Status.Reason, review.Status.EvaluationError),
	)
}

func (in *pods) selfSubjectAccessReview() *authorizationapiv1.SelfSubjectAccessReview {
	return &authorizationapiv1.SelfSubjectAccessReview{
		Spec: authorizationapiv1.SelfSubjectAccessReviewSpec{
			ResourceAttributes: &authorizationapiv1.ResourceAttributes{
				Namespace: in.namespace,
				Verb:      "list",
				Resource:  types.ResourceKindPod,
			},
		},
	}
}

func (in *pods) cacheKey(opts metav1.ListOptions) cache.Key {
	return cache.NewKey(types.ResourceKindPod, in.namespace, in.token, opts)
}

func newPods(c *Client, namespace, token string) v1.PodInterface {
	return &pods{c.CoreV1Client.Pods(namespace), c.authorizationV1, namespace, token}
}
