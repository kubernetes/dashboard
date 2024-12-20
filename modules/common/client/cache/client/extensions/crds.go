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

package extensions

import (
	"context"

	extensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	v1 "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset/typed/apiextensions/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	authorizationv1 "k8s.io/client-go/kubernetes/typed/authorization/v1"

	"k8s.io/dashboard/client/cache/client/common"
	"k8s.io/dashboard/types"
)

type customResourceDefinitions struct {
	v1.CustomResourceDefinitionInterface

	authorizationV1 authorizationv1.AuthorizationV1Interface
	token           string
}

func (in *customResourceDefinitions) List(ctx context.Context, opts metav1.ListOptions) (*extensionsv1.CustomResourceDefinitionList, error) {
	return common.NewCachedResourceLister[extensionsv1.CustomResourceDefinitionList](
		in.authorizationV1,
		common.WithToken[extensionsv1.CustomResourceDefinitionList](in.token),
		common.WithGroup[extensionsv1.CustomResourceDefinitionList](extensionsv1.SchemeGroupVersion.Group),
		common.WithVersion[extensionsv1.CustomResourceDefinitionList](extensionsv1.SchemeGroupVersion.Version),
		common.WithResourceKind[extensionsv1.CustomResourceDefinitionList](types.ResourceKindCustomResourceDefinition),
	).List(ctx, in.CustomResourceDefinitionInterface, opts)
}

func newCustomResourceDefinitions(c *Client, token string) v1.CustomResourceDefinitionInterface {
	return &customResourceDefinitions{
		CustomResourceDefinitionInterface: c.ApiextensionsV1Client.CustomResourceDefinitions(),
		authorizationV1:                   c.authorizationV1,
		token:                             token,
	}
}
