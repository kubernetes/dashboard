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

type persistentVolumeClaims struct {
	v1.PersistentVolumeClaimInterface

	authorizationV1 authorizationv1.AuthorizationV1Interface
	namespace       string
	token           string
}

func (in *persistentVolumeClaims) List(ctx context.Context, opts metav1.ListOptions) (*corev1.PersistentVolumeClaimList, error) {
	return common.NewCachedResourceLister[corev1.PersistentVolumeClaimList](
		in.authorizationV1,
		common.WithNamespace[corev1.PersistentVolumeClaimList](in.namespace),
		common.WithToken[corev1.PersistentVolumeClaimList](in.token),
		common.WithGroup[corev1.PersistentVolumeClaimList](corev1.SchemeGroupVersion.Group),
		common.WithVersion[corev1.PersistentVolumeClaimList](corev1.SchemeGroupVersion.Version),
		common.WithResourceKind[corev1.PersistentVolumeClaimList](types.ResourceKindPersistentVolumeClaim),
	).List(ctx, in.PersistentVolumeClaimInterface, opts)
}

func newPersistentVolumeClaims(c *Client, namespace, token string) v1.PersistentVolumeClaimInterface {
	return &persistentVolumeClaims{c.CoreV1Client.PersistentVolumeClaims(namespace), c.authorizationV1, namespace, token}
}
