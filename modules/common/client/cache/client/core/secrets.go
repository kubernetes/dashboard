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

type secrets struct {
	v1.SecretInterface

	authorizationV1 authorizationv1.AuthorizationV1Interface
	namespace       string
	token           string
	requestGetter   common.RequestGetter
}

func (in *secrets) List(ctx context.Context, opts metav1.ListOptions) (*corev1.SecretList, error) {
	return common.NewCachedResourceLister[corev1.SecretList](
		in.authorizationV1,
		common.WithNamespace[corev1.SecretList](in.namespace),
		common.WithToken[corev1.SecretList](in.token),
		common.WithGroup[corev1.SecretList](corev1.SchemeGroupVersion.Group),
		common.WithVersion[corev1.SecretList](corev1.SchemeGroupVersion.Version),
		common.WithResourceKind[corev1.SecretList](types.ResourceKindSecret),
		common.WithRequestGetter[corev1.SecretList](in.requestGetter),
	).List(ctx, in.SecretInterface, opts)
}

func newSecrets(c *Client, namespace, token string, getter common.RequestGetter) v1.SecretInterface {
	return &secrets{c.CoreV1Client.Secrets(namespace), c.authorizationV1, namespace, token, getter}
}
