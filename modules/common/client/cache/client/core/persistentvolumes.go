// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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

type persistentVolumes struct {
	v1.PersistentVolumeInterface

	authorizationV1 authorizationv1.AuthorizationV1Interface
	token           string
}

func (in *persistentVolumes) List(ctx context.Context, opts metav1.ListOptions) (*corev1.PersistentVolumeList, error) {
	return common.NewCachedResourceLister[corev1.PersistentVolumeList](
		in.authorizationV1,
		common.WithToken[corev1.PersistentVolumeList](in.token),
		common.WithGroup[corev1.PersistentVolumeList](corev1.SchemeGroupVersion.Group),
		common.WithVersion[corev1.PersistentVolumeList](corev1.SchemeGroupVersion.Version),
		common.WithResourceKind[corev1.PersistentVolumeList](types.ResourceKindPersistentVolume),
	).List(ctx, in.PersistentVolumeInterface, opts)
}

func newPersistentVolumes(c *Client, token string) v1.PersistentVolumeInterface {
	return &persistentVolumes{c.CoreV1Client.PersistentVolumes(), c.authorizationV1, token}
}
