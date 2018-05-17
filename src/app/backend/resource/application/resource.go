package application

import (
	"log"
	"strings"

	applicationAlphaClient "github.com/kubernetes-sigs/application/pkg/client/clientset/versioned"
	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
)

type ResourceList struct {
	ListMeta  api.ListMeta    `json:"listMeta"`
	Resources []*ResourceMeta `json:"resources"`
	Errors    []error         `json:"errors"`
}

type ResourceTypeMeta struct {
	Name       string `json:"-"`
	Kind       string `json:"kind"`
	ApiVersion string `json:"apiVersion"`
}

type ResourceMeta struct {
	ObjectMeta api.ObjectMeta   `json:"objectMeta"`
	TypeMeta   ResourceTypeMeta `json:"typeMeta"`
	Scope      string           `json:"scope"`
}

type DynamicClientForApplicationFn func(version string) *dynamic.Client

func GetGenericApplicationResourceList(client applicationAlphaClient.Interface, dyClientFn DynamicClientForApplicationFn, namespace string,
	applicationName string, groupName string, kind string) (*metav1.Object, error) {
	log.Printf("Getting resource list of %s application in %s namespace", applicationName, namespace)

	groupKind := metav1.GroupKind{Group: groupName, Kind: kind}
	apiResource, err := getAPIResourceFromGroupKind(client, groupKind)

	if err != nil {
		return nil, err
	}

	// TODO: Get application first (we need the selector)

	nonCriticalErrors, criticalError := errors.HandleError(err)

	dynamicClient := dyClientFn(apiResource.Version)
	resourceList, err := GetResourceListByAPIResource(dynamicClient, namespace, apiResource)

	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	return resourceList, nil
}

func GetResourceListByAPIResource(client *dynamic.Client, namespace string, resource *metav1.APIResource) ([]*ResourceMeta, error) {
	resourceList, err := client.Resource(resource, namespace).List(metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	rl, _ := resourceList.(*unstructured.UnstructuredList)

	result := []*ResourceMeta{}
	for _, item := range rl.Items {
		resourceMeta := ResourceMeta{
			ObjectMeta: api.ObjectMeta{
				Name:              item.GetName(),
				Namespace:         item.GetNamespace(),
				Labels:            item.GetLabels(),
				Annotations:       item.GetAnnotations(),
				CreationTimestamp: item.GetCreationTimestamp(),
			},
			TypeMeta: ResourceTypeMeta{
				Name:       resource.Name,
				Kind:       item.GetKind(),
				ApiVersion: item.GetAPIVersion(),
			},
		}
		result = append(result, &resourceMeta)
	}
	return result, nil
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
