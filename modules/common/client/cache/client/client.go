package client

import (
	client "k8s.io/client-go/kubernetes"
	v1 "k8s.io/client-go/kubernetes/typed/core/v1"
	"k8s.io/client-go/rest"

	"k8s.io/dashboard/client/cache/client/core"
)

// CachedInterface is a custom wrapper around the [client.Interface].
// It allows certain requests such as LIST to be cached to optimize
// the response time. It is especially helpful when dealing with
// clusters with big amount of resources.
type CachedInterface interface {
	client.Interface
}

type cachedClientset struct {
	*client.Clientset

	coreV1 v1.CoreV1Interface
}

func (in *cachedClientset) CoreV1() v1.CoreV1Interface {
	return in.coreV1
}

func New(config *rest.Config, clusterContext string) (CachedInterface, error) {
	var cs cachedClientset
	var err error

	configShallowCopy := *config
	if configShallowCopy.UserAgent == "" {
		configShallowCopy.UserAgent = rest.DefaultKubernetesUserAgent()
	}

	clientset, err := client.NewForConfig(&configShallowCopy)
	if err != nil {
		return nil, err
	}

	cs.coreV1, err = core.NewClient(&configShallowCopy, clientset.AuthorizationV1(), clusterContext)
	if err != nil {
		return nil, err
	}

	cs.Clientset = clientset
	return &cs, nil
}
