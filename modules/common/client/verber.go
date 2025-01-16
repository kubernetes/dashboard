// Copyright 2017 The Kubernetes Authors.
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

package client

import (
	"context"
	"fmt"
	"net/http"
	"reflect"
	"strings"

	jsonpatch "github.com/evanphx/json-patch/v5"
	"github.com/gobuffalo/flect"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	k8stypes "k8s.io/apimachinery/pkg/types"
	"k8s.io/apimachinery/pkg/util/strategicpatch"
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/util/retry"
	"k8s.io/klog/v2"
)

var (
	kindToGroupVersionResource = map[string]schema.GroupVersionResource{}
)

// resourceVerber is a struct responsible for doing common verb operations on resources, like
// DELETE, PUT, UPDATE.
type resourceVerber struct {
	client    dynamic.Interface
	discovery discovery.DiscoveryInterface
}

func (v *resourceVerber) groupVersionResourceFromUnstructured(object *unstructured.Unstructured) schema.GroupVersionResource {
	gvk := object.GetObjectKind().GroupVersionKind()

	return schema.GroupVersionResource{
		Group:    gvk.Group,
		Version:  gvk.Version,
		Resource: flect.Pluralize(strings.ToLower(gvk.Kind)),
	}
}

func (v *resourceVerber) groupVersionResourceFromKind(kind string) (schema.GroupVersionResource, error) {
	if gvr, exists := kindToGroupVersionResource[kind]; exists {
		klog.V(4).InfoS("GroupVersionResource cache hit", "kind", kind)
		return gvr, nil
	}

	klog.V(4).InfoS("GroupVersionResource cache miss", "kind", kind)
	_, resourceList, err := v.discovery.ServerGroupsAndResources()
	if err != nil {
		return schema.GroupVersionResource{}, err
	}

	// Update cache
	if err = v.buildGroupVersionResourceCache(resourceList); err != nil {
		return schema.GroupVersionResource{}, err
	}

	if gvr, exists := kindToGroupVersionResource[kind]; exists {
		return gvr, nil
	}

	return schema.GroupVersionResource{}, fmt.Errorf("could not find GVR for kind %s", kind)
}

func (v *resourceVerber) buildGroupVersionResourceCache(resourceList []*metav1.APIResourceList) error {
	for _, resource := range resourceList {
		gv, err := schema.ParseGroupVersion(resource.GroupVersion)
		if err != nil {
			return err
		}

		for _, apiResource := range resource.APIResources {
			crdKind := fmt.Sprintf("%s.%s", apiResource.Name, gv.Group)
			gvr := schema.GroupVersionResource{
				Group:    gv.Group,
				Version:  gv.Version,
				Resource: apiResource.Name,
			}

			// Ignore sub-resources. Top level resource names should not contain slash
			if strings.Contains(apiResource.Name, "/") {
				continue
			}

			// Mapping for core resources
			kindToGroupVersionResource[strings.ToLower(apiResource.Kind)] = gvr

			// Mapping for CRD resources with custom kind
			kindToGroupVersionResource[crdKind] = gvr
		}
	}

	return nil
}

func (v *resourceVerber) toDeletePropagationPolicy(propagation string) metav1.DeletionPropagation {
	switch metav1.DeletionPropagation(propagation) {
	case metav1.DeletePropagationBackground:
		return metav1.DeletePropagationBackground
	case metav1.DeletePropagationForeground:
		return metav1.DeletePropagationForeground
	case metav1.DeletePropagationOrphan:
		return metav1.DeletePropagationOrphan
	}

	// Do cascade delete by default, as this is what users typically expect.
	return metav1.DeletePropagationForeground
}

// Delete deletes the resource of the given kind in the given namespace with the given name.
func (v *resourceVerber) Delete(kind string, namespace string, name string, propagationPolicy string, deleteNow bool) error {
	gvr, err := v.groupVersionResourceFromKind(kind)
	if err != nil {
		return err
	}

	defaultPropagationPolicy := v.toDeletePropagationPolicy(propagationPolicy)
	defaultDeleteOptions := metav1.DeleteOptions{
		PropagationPolicy: &defaultPropagationPolicy,
	}

	if deleteNow {
		gracePeriodSeconds := int64(1)
		defaultDeleteOptions.GracePeriodSeconds = &gracePeriodSeconds
	}

	klog.V(2).InfoS("deleting resource", "kind", kind, "namespace", namespace, "name", name, "propagationPolicy", propagationPolicy, "deleteNow", deleteNow)
	return v.client.Resource(gvr).Namespace(namespace).Delete(context.TODO(), name, defaultDeleteOptions)
}

// Update patches resource of the given kind in the given namespace with the given name.
func (v *resourceVerber) Update(object *unstructured.Unstructured) error {
	name := object.GetName()
	namespace := object.GetNamespace()
	gvr := v.groupVersionResourceFromUnstructured(object)

	return retry.RetryOnConflict(retry.DefaultRetry, func() error {
		klog.V(4).InfoS("fetching latest resource version", "group", gvr.Group, "version", gvr.Version, "resource", gvr.Resource, "name", name, "namespace", namespace)
		result, getErr := v.client.Resource(gvr).Namespace(namespace).Get(context.TODO(), name, metav1.GetOptions{})
		if getErr != nil {
			return fmt.Errorf("failed to get latest %s version: %w", gvr.Resource, getErr)
		}

		origData, err := result.MarshalJSON()
		if err != nil {
			return fmt.Errorf("failed to marshal original data: %w", err)
		}

		// Update resource version from latest object to not end up with resource version conflict.
		object.SetResourceVersion(result.GetResourceVersion())
		modifiedData, err := object.MarshalJSON()
		if err != nil {
			return fmt.Errorf("failed to marshal modified data: %w", err)
		}

		if reflect.DeepEqual(result, object) {
			klog.V(3).InfoS("original and updated objects are the same, skipping")
			return nil
		}

		versionedObject, err := scheme.Scheme.New(schema.GroupVersionKind{
			Group:   gvr.Group,
			Version: gvr.Version,
			Kind:    object.GetKind(),
		})

		switch {
		case runtime.IsNotRegisteredError(err):
			patchBytes, err := jsonpatch.CreateMergePatch(origData, modifiedData)
			if err != nil {
				return fmt.Errorf("failed creating merge patch: %w", err)
			}

			klog.V(2).InfoS("patching resource", "group", gvr.Group, "version", gvr.Version, "resource", gvr.Resource, "name", name, "namespace", namespace, "patch", string(patchBytes))
			_, updateErr := v.client.Resource(gvr).Namespace(namespace).Patch(context.TODO(), name, k8stypes.MergePatchType, patchBytes, metav1.PatchOptions{})
			return updateErr
		case err != nil:
			return err
		default:
			patchBytes, err := strategicpatch.CreateTwoWayMergePatch(origData, modifiedData, versionedObject)
			if err != nil {
				return fmt.Errorf("failed creating two way merge patch: %w", err)
			}

			klog.V(2).InfoS("patching resource", "group", gvr.Group, "version", gvr.Version, "resource", gvr.Resource, "name", name, "namespace", namespace, "patch", string(patchBytes))
			_, updateErr := v.client.Resource(gvr).Namespace(namespace).Patch(context.TODO(), name, k8stypes.StrategicMergePatchType, patchBytes, metav1.PatchOptions{})
			return updateErr
		}
	})
}

// Get gets the resource of the given kind in the given namespace with the given name.
func (v *resourceVerber) Get(kind string, namespace string, name string) (runtime.Object, error) {
	gvr, err := v.groupVersionResourceFromKind(kind)
	if err != nil {
		return nil, err
	}

	return v.client.Resource(gvr).Namespace(namespace).Get(context.TODO(), name, metav1.GetOptions{})
}

func VerberClient(request *http.Request) (ResourceVerber, error) {
	config, err := configFromRequest(request)
	if err != nil {
		return nil, err
	}

	discoveryClient, err := discovery.NewDiscoveryClientForConfig(config)
	if err != nil {
		return nil, err
	}

	dynamicConfig := dynamic.ConfigFor(config)

	dynamicClient, err := dynamic.NewForConfig(dynamicConfig)
	if err != nil {
		return nil, err
	}

	return &resourceVerber{
		client:    dynamicClient,
		discovery: discoveryClient,
	}, nil
}
