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
