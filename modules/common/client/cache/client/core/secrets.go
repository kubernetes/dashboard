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

type secrets struct {
	v1.SecretInterface

	authorizationV1 authorizationv1.AuthorizationV1Interface
	namespace       string
	token           string
}

func (in *secrets) List(ctx context.Context, opts metav1.ListOptions) (*corev1.SecretList, error) {
	return client.NewCachedResourceLister[corev1.SecretList](
		in.authorizationV1,
		in.namespace,
		in.token,
		types.ResourceKindSecret,
	).List(ctx, in.SecretInterface, opts)
}

func newSecrets(c *Client, namespace, token string) v1.SecretInterface {
	return &secrets{c.CoreV1Client.Secrets(namespace), c.authorizationV1, namespace, token}
}
