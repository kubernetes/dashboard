package application

import (
	"log"
	"strings"

	applicationAlphaClient "github.com/kubernetes-sigs/application/pkg/client/clientset/versioned"
	"github.com/kubernetes/dashboard/src/app/backend/api"
	clientApi "github.com/kubernetes/dashboard/src/app/backend/client/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/fields"
	"k8s.io/apimachinery/pkg/labels"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
)

type ResourceList struct {
	ListMeta  api.ListMeta    `json:"listMeta"`
	Resources []*ResourceMeta `json:"resources"`
	Errors    []error         `json:"errors"`
}

type ResourceMeta struct {
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
	TypeMeta   api.TypeMeta   `json:"typeMeta"`
}

type ResourceMetaList []*ResourceMeta

func (r *ResourceMeta) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
	switch name {
	case dataselect.NameProperty:
		return dataselect.StdComparableString(r.ObjectMeta.Name)
	case dataselect.CreationTimestampProperty:
		return dataselect.StdComparableTime(r.ObjectMeta.CreationTimestamp.Time)
	case dataselect.NamespaceProperty:
		return dataselect.StdComparableString(r.ObjectMeta.Namespace)
	default:
		return nil
	}
}

func (rl ResourceMetaList) Len() int {
	return len(rl)
}

func (rl ResourceMetaList) Swap(i, j int) {
	rl[i], rl[j] = rl[j], rl[i]
}

func GetGenericApplicationResources(client applicationAlphaClient.Interface,
	dyClientFn clientApi.DynamicClientFn, dsQuery *dataselect.DataSelectQuery, namespace string,
	applicationName string, groupName string, kind string) (*ResourceList, error) {
	log.Printf("Getting resource list of %s application in %s namespace", applicationName, namespace)

	groupKind := metav1.GroupKind{Group: groupName, Kind: kind}
	apiResource, err := getAPIResourceFromGroupKind(client, groupKind)

	if err != nil {
		return nil, err
	}
	nonCriticalErrors, criticalError := errors.HandleError(err)

	application, err := GetApplicationDetail(client, namespace, applicationName)
	if err != nil {
		return nil, err
	}
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)

	groupVersion := schema.GroupVersion{Group: apiResource.Group, Version: apiResource.Version}
	dynamicClient, err := dyClientFn(&groupVersion)

	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	labelSelector := labels.SelectorFromSet(application.Selector)

	listOptions := metav1.ListOptions{
		LabelSelector: labelSelector.String(),
		FieldSelector: fields.Everything().String(),
	}

	resourceList, err := GetResourceListByAPIResource(dynamicClient, namespace, apiResource, &listOptions)

	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	result := ResourceList{}
	rCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toGenericResourceCells(resourceList), dsQuery)
	result.ListMeta.TotalItems = filteredTotal
	result.Resources = fromGenericResourceCells(rCells)

	return &result, nil
}

func GetResourceListByAPIResource(client *dynamic.Client, namespace string, resource *metav1.APIResource, listOptions *metav1.ListOptions) ([]*ResourceMeta, error) {
	resourceList, err := client.Resource(resource, namespace).List(*listOptions)
	if err != nil {
		return nil, err
	}

	rl, _ := resourceList.(*unstructured.UnstructuredList)

	result := []*ResourceMeta{}
	for _, item := range rl.Items {
		resourceKind := api.ResourceKind(strings.ToLower(item.GetKind()))
		resourceMeta := ResourceMeta{
			ObjectMeta: api.ObjectMeta{
				Name:              item.GetName(),
				Namespace:         item.GetNamespace(),
				Labels:            item.GetLabels(),
				Annotations:       item.GetAnnotations(),
				CreationTimestamp: item.GetCreationTimestamp(),
			},
			TypeMeta: api.NewTypeMeta(resourceKind),
		}
		result = append(result, &resourceMeta)
	}
	return result, nil
}

func toGenericResourceCells(std []*ResourceMeta) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = std[i]
	}
	return cells
}

func fromGenericResourceCells(cells []dataselect.DataCell) []*ResourceMeta {
	std := make([]*ResourceMeta, len(cells))
	for i := range std {
		std[i] = cells[i].(*ResourceMeta)
	}
	return std
}

func getAPIResourceFromGroupKind(client applicationAlphaClient.Interface, groupKind metav1.GroupKind) (*metav1.APIResource, error) {
	serverResourceList, err := client.Discovery().ServerPreferredNamespacedResources()
	if err != nil {
		return nil, err
	}

	// Remap core to emtpy to make it compatible for filtering
	if groupKind.Group == "core" {
		groupKind.Group = ""
	}

	for _, resourceList := range serverResourceList {
		for _, apiResource := range resourceList.APIResources {
			groupVersion, _ := schema.ParseGroupVersion(resourceList.GroupVersion)
			if canResourceList(apiResource) && groupVersion.Group == groupKind.Group && apiResource.Kind == groupKind.Kind {
				apiResource.Version = groupVersion.Version
				apiResource.Group = groupVersion.Group
				return &apiResource, nil
			}
		}
	}

	return nil, nil
}

// canResourceList checks if the given resource can be listed
func canResourceList(resource metav1.APIResource) bool {
	if strings.Contains(resource.Name, "/") {
		return false
	}

	for _, v := range resource.Verbs {
		if v == "list" {
			return true
		}
	}
	return false
}
