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
	clusterContext  string
}

func (in *pods) List(ctx context.Context, opts metav1.ListOptions) (*corev1.PodList, error) {
	cachedList, found, err := cache.FromCache[*corev1.PodList](in.clusterContext, in.cacheKey())
	if err != nil {
		return nil, err
	}

	if !found {
		list, err := in.PodInterface.List(ctx, opts)
		if err != nil {
			return nil, err
		}

		klog.V(3).InfoS("pods not found in cache, initializing", "context", in.clusterContext, "cache-key", in.cacheKey())
		return list, cache.SetCacheValue[*corev1.PodList](in.clusterContext, in.cacheKey(), list)
	}

	review, err := in.authorizationV1.SelfSubjectAccessReviews().Create(ctx, in.selfSubjectAccessReview(), metav1.CreateOptions{})
	if err != nil {
		return nil, err
	}

	if review.Status.Allowed {
		klog.V(3).InfoS("pods found in cache, updating in background", "context", in.clusterContext, "cache-key", in.cacheKey())
		cache.DeferredCacheLoad[*corev1.PodList](in.clusterContext, in.cacheKey(), func() (*corev1.PodList, error) {
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

func (in *pods) cacheKey() string {
	if len(in.namespace) == 0 {
		return types.ResourceKindPod
	}

	return fmt.Sprintf("%s/%s", in.namespace, types.ResourceKindPod)
}

func newPods(c *Client, namespace, clusterContext string) v1.PodInterface {
	return &pods{c.CoreV1Client.Pods(namespace), c.authorizationV1, namespace, clusterContext}
}
