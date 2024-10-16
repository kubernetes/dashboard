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

type namespaces struct {
	v1.NamespaceInterface

	authorizationV1 authorizationv1.AuthorizationV1Interface
	token           string
}

func (in *namespaces) List(ctx context.Context, opts metav1.ListOptions) (*corev1.NamespaceList, error) {
	return common.NewCachedClusterScopedResourceLister[corev1.NamespaceList](
		in.authorizationV1,
		in.token,
		types.ResourceKindNamespace,
	).List(ctx, in.NamespaceInterface, opts)
}

func newNamespaces(c *Client, token string) v1.NamespaceInterface {
	return &namespaces{c.CoreV1Client.Namespaces(), c.authorizationV1, token}
}
