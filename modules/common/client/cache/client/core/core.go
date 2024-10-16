package core

import (
	authorizationv1 "k8s.io/client-go/kubernetes/typed/authorization/v1"
	corev1 "k8s.io/client-go/kubernetes/typed/core/v1"
	"k8s.io/client-go/rest"
)

type Client struct {
	*corev1.CoreV1Client

	authorizationV1 authorizationv1.AuthorizationV1Interface
	token           string
}

func (in *Client) Pods(namespace string) corev1.PodInterface {
	return newPods(in, namespace, in.token)
}

func (in *Client) ConfigMaps(namespace string) corev1.ConfigMapInterface {
	return newConfigMaps(in, namespace, in.token)
}

func (in *Client) Secrets(namespace string) corev1.SecretInterface {
	return newSecrets(in, namespace, in.token)
}

func (in *Client) Namespaces() corev1.NamespaceInterface {
	return newNamespaces(in, in.token)
}

func (in *Client) Nodes() corev1.NodeInterface {
	return newNodes(in, in.token)
}

func NewClient(c *rest.Config, authorizationV1 authorizationv1.AuthorizationV1Interface, token string) (corev1.CoreV1Interface, error) {
	httpClient, err := rest.HTTPClientFor(c)
	if err != nil {
		return nil, err
	}

	client, err := corev1.NewForConfigAndClient(c, httpClient)
	if err != nil {
		return nil, err
	}

	return &Client{
		client,
		authorizationV1,
		token,
	}, nil
}
