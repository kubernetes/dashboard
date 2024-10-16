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

type persistentVolumes struct {
	v1.PersistentVolumeInterface

	authorizationV1 authorizationv1.AuthorizationV1Interface
	token           string
}

func (in *persistentVolumes) List(ctx context.Context, opts metav1.ListOptions) (*corev1.PersistentVolumeList, error) {
	return client.NewCachedClusterScopedResourceLister[corev1.PersistentVolumeList](
		in.authorizationV1,
		in.token,
		types.ResourceKindPersistentVolume,
	).List(ctx, in.PersistentVolumeInterface, opts)
}

func newPersistentVolumes(c *Client, token string) v1.PersistentVolumeInterface {
	return &persistentVolumes{c.CoreV1Client.PersistentVolumes(), c.authorizationV1, token}
}
