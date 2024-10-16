package core

import (
	"context"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	authorizationv1 "k8s.io/client-go/kubernetes/typed/authorization/v1"
	v1 "k8s.io/client-go/kubernetes/typed/core/v1"

	"k8s.io/dashboard/types"
)

type persistentVolumeClaims struct {
	v1.PersistentVolumeClaimInterface

	authorizationV1 authorizationv1.AuthorizationV1Interface
	namespace       string
	token           string
}

func (in *persistentVolumeClaims) List(ctx context.Context, opts metav1.ListOptions) (*corev1.PersistentVolumeClaimList, error) {
	return NewCachedResourceLister[corev1.PersistentVolumeClaimList](
		in.authorizationV1,
		in.namespace,
		in.token,
		types.ResourceKindPersistentVolumeClaim,
	).List(ctx, in.PersistentVolumeClaimInterface, opts)
}

func newPersistentVolumeClaims(c *Client, namespace, token string) v1.PersistentVolumeClaimInterface {
	return &persistentVolumeClaims{c.CoreV1Client.PersistentVolumeClaims(namespace), c.authorizationV1, namespace, token}
}
