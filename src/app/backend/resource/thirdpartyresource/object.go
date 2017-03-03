package thirdpartyresource

import (
	"log"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/util/json"
	"k8s.io/client-go/pkg/api"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
	"k8s.io/client-go/tools/clientcmd"
)

type ThirdPartyResourceObject struct {
	metav1.TypeMeta `json:",inline"`
	Metadata        metav1.ObjectMeta `json:"metadata,omitempty"`
}

type ThirdPartyResourceObjectList struct {
	metav1.TypeMeta `json:",inline"`
	Metadata        metav1.ListMeta            `json:"metadata,omitempty"`
	Items           []ThirdPartyResourceObject `json:"items"`
}

func (object *ThirdPartyResourceObject) GetObjectKind() schema.ObjectKind {
	return &object.TypeMeta
}

func (object *ThirdPartyResourceObject) GetObjectMeta() *metav1.ObjectMeta {
	return &object.Metadata
}

func (list *ThirdPartyResourceObjectList) GetObjectKind() schema.ObjectKind {
	return &list.TypeMeta
}

func (list *ThirdPartyResourceObjectList) GetListMeta() metav1.List {
	return &list.Metadata
}

func getThirdPartyResourceObjects(config clientcmd.ClientConfig, thirdPartyResource *extensions.ThirdPartyResource) ThirdPartyResourceObjectList {
	var list ThirdPartyResourceObjectList

	restConfig, err := newClientConfig(config, getThirdPartyResourceGroupVersion(thirdPartyResource))
	if err != nil {
		log.Println(err)
		return list
	}

	restClient, err := newRESTClient(restConfig)
	if err != nil {
		log.Println(err)
		return list
	}

	raw, err := restClient.Get().Resource(getThirdPartyResourcePluralName(thirdPartyResource)).Namespace(api.NamespaceAll).Do().Raw()
	if err != nil {
		log.Println(err)
		return list
	}

	err = json.Unmarshal(raw, &list)
	if err != nil {
		log.Println(err)
		return list
	}

	return list
}
