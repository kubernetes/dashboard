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

type nodes struct {
	v1.NodeInterface

	authorizationV1 authorizationv1.AuthorizationV1Interface
	token           string
}

func (in *nodes) List(ctx context.Context, opts metav1.ListOptions) (*corev1.NodeList, error) {
	return common.NewCachedResourceLister[corev1.NodeList](
		in.authorizationV1,
		common.WithToken[corev1.NodeList](in.token),
		common.WithGroup[corev1.NodeList](corev1.SchemeGroupVersion.Group),
		common.WithVersion[corev1.NodeList](corev1.SchemeGroupVersion.Version),
		common.WithResourceKind[corev1.NodeList](types.ResourceKindNode),
	).List(ctx, in.NodeInterface, opts)
}

func newNodes(c *Client, token string) v1.NodeInterface {
	return &nodes{c.CoreV1Client.Nodes(), c.authorizationV1, token}
}
