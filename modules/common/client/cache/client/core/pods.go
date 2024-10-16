package core

import (
	"context"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	authorizationv1 "k8s.io/client-go/kubernetes/typed/authorization/v1"
	v1 "k8s.io/client-go/kubernetes/typed/core/v1"
	"k8s.io/dashboard/client/cache/client/common"
	"k8s.io/dashboard/types"
)

type pods struct {
	v1.PodInterface

	authorizationV1 authorizationv1.AuthorizationV1Interface
	namespace       string
	token           string
}

func (in *pods) List(ctx context.Context, opts metav1.ListOptions) (*corev1.PodList, error) {
	return common.NewCachedResourceLister[corev1.PodList](
		in.authorizationV1,
		in.namespace,
		in.token,
		types.ResourceKindPod,
	).List(ctx, in.PodInterface, opts)
}

func newPods(c *Client, namespace, token string) v1.PodInterface {
	return &pods{c.CoreV1Client.Pods(namespace), c.authorizationV1, namespace, token}
}
