package thirdpartyresource

import (
	"log"
	"strings"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/util/json"
	k8sClient "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/pkg/api"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
	"k8s.io/client-go/rest"
)

// ThirdPartyResourceObject is a single instance of third party resource.
type ThirdPartyResourceObject struct {
	metav1.TypeMeta `json:",inline"`
	Metadata        metav1.ObjectMeta `json:"metadata,omitempty"`
}

// ThirdPartyResourceObjectList is a list of third party resource instances.
type ThirdPartyResourceObjectList struct {
	ListMeta        common.ListMeta `json:"listMeta"`
	metav1.TypeMeta `json:",inline"`
	Items           []ThirdPartyResourceObject `json:"items"`
}

// GetThirdPartyResourceObjects return list of third party resource instances. Channels cannot be
// used here yet, because we operate on raw JSONs.
func GetThirdPartyResourceObjects(client k8sClient.Interface, config *rest.Config,
	dsQuery *dataselect.DataSelectQuery, tprName string) (ThirdPartyResourceObjectList, error) {

	log.Printf("Getting third party resource %s objects", tprName)
	var list ThirdPartyResourceObjectList

	thirdPartyResource, err := client.ExtensionsV1beta1().ThirdPartyResources().Get(tprName, metaV1.GetOptions{})
	if err != nil {
		return list, err
	}

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

	// Unmarshal raw data to JSON.
	err = json.Unmarshal(raw, &list)

	// Update total count of items.
	list.ListMeta.TotalItems = len(list.Items)

	// Return only slice of data, pagination is done here.
	tprObjectCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toObjectCells(list.Items), dsQuery)
	list.Items = fromObjectCells(tprObjectCells)
	list.ListMeta = common.ListMeta{TotalItems: filteredTotal}

	return list, err
}

// getThirdPartyResourceGroupVersion returns first group version of third party resource. It's also known as
// preferredVersion.
func getThirdPartyResourceGroupVersion(thirdPartyResource *extensions.ThirdPartyResource) schema.GroupVersion {
	version := ""
	if len(thirdPartyResource.Versions) > 0 {
		version = thirdPartyResource.Versions[0].Name
	}

	group := ""
	if strings.Contains(thirdPartyResource.ObjectMeta.Name, ".") {
		group = thirdPartyResource.ObjectMeta.Name[strings.Index(thirdPartyResource.ObjectMeta.Name, ".")+1:]
	} else {
		group = thirdPartyResource.ObjectMeta.Name
	}

	return schema.GroupVersion{
		Group:   group,
		Version: version,
	}
}

// getThirdPartyResourcePluralName returns third party resource object plural name, which can be used in API calls.
func getThirdPartyResourcePluralName(thirdPartyResource *extensions.ThirdPartyResource) string {
	name := strings.ToLower(thirdPartyResource.ObjectMeta.Name)

	if strings.Contains(name, "-") {
		name = strings.Replace(name, "-", "", -1)
	}

	if strings.Contains(name, ".") {
		name = name[:strings.Index(name, ".")]
	}

	if strings.HasSuffix(name, "s") {
		name += "es"
	} else {
		name += "s"
	}

	return name
}
