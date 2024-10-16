package core

import (
	"context"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	authorizationv1 "k8s.io/client-go/kubernetes/typed/authorization/v1"
	v1 "k8s.io/client-go/kubernetes/typed/core/v1"
	"k8s.io/dashboard/client/cache/client"

	"k8s.io/dashboard/types"
)

type configmaps struct {
	v1.ConfigMapInterface

	authorizationV1 authorizationv1.AuthorizationV1Interface
	namespace       string
	token           string
}

func (in *configmaps) List(ctx context.Context, opts metav1.ListOptions) (*corev1.ConfigMapList, error) {
	return client.NewCachedResourceLister[corev1.ConfigMapList](
		in.authorizationV1,
		in.namespace,
		in.token,
		types.ResourceKindConfigMap,
	).List(ctx, in.ConfigMapInterface, opts)
}

func newConfigMaps(c *Client, namespace, token string) v1.ConfigMapInterface {
	return &configmaps{c.CoreV1Client.ConfigMaps(namespace), c.authorizationV1, namespace, token}
}
