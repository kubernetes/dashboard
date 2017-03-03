package thirdpartyresource

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/json"
	"k8s.io/client-go/pkg/api"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
	"k8s.io/client-go/tools/clientcmd"
)

// ThirdPartyResourceObject is a single instance of third party resource.
type ThirdPartyResourceObject struct {
	metav1.TypeMeta `json:",inline"`
	Metadata        metav1.ObjectMeta `json:"metadata,omitempty"`
}

// ThirdPartyResourceObjectList is a list of third party resource instances.
type ThirdPartyResourceObjectList struct {
	metav1.TypeMeta `json:",inline"`
	Metadata        metav1.ListMeta            `json:"metadata,omitempty"`
	Items           []ThirdPartyResourceObject `json:"items"`
}

func getThirdPartyResourceObjects(config clientcmd.ClientConfig, thirdPartyResource *extensions.ThirdPartyResource) (ThirdPartyResourceObjectList, error) {
	var list ThirdPartyResourceObjectList

	restConfig, err := newClientConfig(config, getThirdPartyResourceGroupVersion(thirdPartyResource))
	if err != nil {
		return list, err
	}

	restClient, err := newRESTClient(restConfig)
	if err != nil {
		return list, err
	}

	raw, err := restClient.Get().Resource(getThirdPartyResourcePluralName(thirdPartyResource)).Namespace(api.NamespaceAll).Do().Raw()
	if err != nil {
		return list, err
	}

	err = json.Unmarshal(raw, &list)
	return list, err
}
