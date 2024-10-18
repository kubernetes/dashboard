package extensions

import (
	v1 "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset/typed/apiextensions/v1"
	authorizationv1 "k8s.io/client-go/kubernetes/typed/authorization/v1"
	"k8s.io/client-go/rest"
)

type Client struct {
	*v1.ApiextensionsV1Client

	authorizationV1 authorizationv1.AuthorizationV1Interface
	token           string
}

func (in *Client) CustomResourceDefinitions() v1.CustomResourceDefinitionInterface {
	return newCustomResourceDefinitions(in, in.token)
}

func NewClient(c *rest.Config, authorizationV1 authorizationv1.AuthorizationV1Interface, token string) (v1.ApiextensionsV1Interface, error) {
	httpClient, err := rest.HTTPClientFor(c)
	if err != nil {
		return nil, err
	}

	client, err := v1.NewForConfigAndClient(c, httpClient)
	if err != nil {
		return nil, err
	}

	return &Client{
		client,
		authorizationV1,
		token,
	}, nil
}
