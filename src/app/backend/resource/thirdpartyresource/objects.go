// Copyright 2017 The Kubernetes Dashboard Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package thirdpartyresource

import (
	"log"
	"strings"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/util/json"
	k8sClient "k8s.io/client-go/kubernetes"
	kubeapi "k8s.io/client-go/pkg/api"
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
	ListMeta        api.ListMeta `json:"listMeta"`
	metav1.TypeMeta `json:",inline"`
	Items           []ThirdPartyResourceObject `json:"items"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// GetThirdPartyResourceObjects return list of third party resource instances. Channels cannot be
// used here yet, because we operate on raw JSONs.
func GetThirdPartyResourceObjects(client k8sClient.Interface, config *rest.Config,
	dsQuery *dataselect.DataSelectQuery, tprName string) (ThirdPartyResourceObjectList, error) {

	log.Printf("Getting third party resource %s objects", tprName)
	var list ThirdPartyResourceObjectList

	thirdPartyResource, err := client.ExtensionsV1beta1().ThirdPartyResources().Get(tprName, metaV1.GetOptions{})
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return list, criticalError
	}

	restClient, err := newRESTClient(newRESTConfig(config, getThirdPartyResourceGroupVersion(thirdPartyResource)))
	if err != nil {
		return list, err
	}

	raw, err := restClient.Get().Resource(getThirdPartyResourcePluralName(thirdPartyResource)).
		Namespace(kubeapi.NamespaceAll).Do().Raw()
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return list, criticalError
	}

	// Unmarshal raw data to JSON.
	err = json.Unmarshal(raw, &list)

	// Return only slice of data, pagination is done here.
	tprObjectCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toObjectCells(list.Items), dsQuery)
	list.Items = fromObjectCells(tprObjectCells)
	list.ListMeta = api.ListMeta{TotalItems: filteredTotal}
	list.Errors = nonCriticalErrors

	return list, err
}

// getThirdPartyResourceGroupVersion returns first group version of third party resource.
// It's also known as preferredVersion.
func getThirdPartyResourceGroupVersion(tpr *extensions.ThirdPartyResource) schema.GroupVersion {
	version := ""
	if len(tpr.Versions) > 0 {
		version = tpr.Versions[0].Name
	}

	group := ""
	if strings.Contains(tpr.ObjectMeta.Name, ".") {
		group = tpr.ObjectMeta.Name[strings.Index(tpr.ObjectMeta.Name, ".")+1:]
	} else {
		group = tpr.ObjectMeta.Name
	}

	return schema.GroupVersion{
		Group:   group,
		Version: version,
	}
}

// getThirdPartyResourcePluralName returns third party resource object plural name, which can be used in API calls.
func getThirdPartyResourcePluralName(tpr *extensions.ThirdPartyResource) string {
	name := strings.ToLower(tpr.ObjectMeta.Name)

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
