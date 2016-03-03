// Copyright 2015 Google Inc. All Rights Reserved.
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

package main

import (
	"log"

	"k8s.io/kubernetes/pkg/api"
	unversioned "k8s.io/kubernetes/pkg/api/unversioned"
	"k8s.io/kubernetes/pkg/apis/extensions"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
)

// DaemonSeDetail represents detailed information about a Daemon Set.
type DaemonSetDetail struct {
	// Name of the Daemon Set.
	Name string `json:"name"`

	// Namespace the Daemon Set is in.
	Namespace string `json:"namespace"`

	// Label mapping of the Daemon Set.
	Labels map[string]string `json:"labels"`

	// Label selector of the Daemon Set.
	LabelSelector *unversioned.LabelSelector `json:"labelSelector,omitempty"`

	// Container image list of the pod template specified by this Daemon Set.
	ContainerImages []string `json:"containerImages"`

	// Aggregate information about pods of this daemon set.
	PodInfo DaemonSetPodInfo `json:"podInfo"`

	// Detailed information about Pods belonging to this Daemon Set.
	Pods []DaemonSetPod `json:"pods"`

	// Detailed information about service related to Daemon Set.
	Services []ServiceDetail `json:"services"`

	// True when the data contains at least one pod with metrics information, false otherwise.
	HasMetrics bool `json:"hasMetrics"`
}

// Detailed information about a Pod that belongs to a Daemon Set
type DaemonSetPod struct {
	// Name of the Pod.
	Name string `json:"name"`

	// Status of the Pod. See Kubernetes API for reference.
	PodPhase api.PodPhase `json:"podPhase"`

	// Time the Pod has started. Empty if not started.
	StartTime *unversioned.Time `json:"startTime"`

	// IP address of the Pod.
	PodIP string `json:"podIP"`

	// Name of the Node this Pod runs on.
	NodeName string `json:"nodeName"`

	// Count of containers restarts.
	RestartCount int `json:"restartCount"`

	// Pod metrics.
	Metrics *PodMetrics `json:"metrics"`
}

// Returns detailed information about the given daemon set in the given namespace.
func GetDaemonSetDetail(client client.Interface, heapsterClient HeapsterClient,
	namespace, name string) (*DaemonSetDetail, error) {
	log.Printf("Getting details of %s daemon set in %s namespace", name, namespace)

	daemonSetWithPods, err := getRawDaemonSetWithPods(client, namespace, name)
	if err != nil {
		return nil, err
	}
	daemonSet := daemonSetWithPods.DaemonSet
	pods := daemonSetWithPods.Pods

	daemonSetMetricsByPod, err := getDaemonSetPodsMetrics(pods, heapsterClient, namespace, name)
	if err != nil {
		log.Printf("Skipping Heapster metrics because of error: %s\n", err)
	}

	services, err := client.Services(namespace).List(api.ListOptions{
		LabelSelector: labels.Everything(),
		FieldSelector: fields.Everything(),
	})

	if err != nil {
		return nil, err
	}

	daemonSetDetail := &DaemonSetDetail{
		Name:          daemonSet.Name,
		Namespace:     daemonSet.Namespace,
		Labels:        daemonSet.ObjectMeta.Labels,
		LabelSelector: daemonSet.Spec.Selector,
		PodInfo:       getDaemonSetPodInfo(daemonSet, pods.Items),
	}

	matchingServices := getMatchingServicesforDS(services.Items, daemonSet)

	// Anonymous callback function to get nodes by their names.
	getNodeFn := func(nodeName string) (*api.Node, error) {
		return client.Nodes().Get(nodeName)
	}

	for _, service := range matchingServices {
		daemonSetDetail.Services = append(daemonSetDetail.Services,
			getServiceDetailforDS(service, *daemonSet, pods.Items, getNodeFn))
	}

	for _, container := range daemonSet.Spec.Template.Spec.Containers {
		daemonSetDetail.ContainerImages = append(daemonSetDetail.ContainerImages,
			container.Image)
	}

	for _, pod := range pods.Items {
		podDetail := DaemonSetPod{
			Name:         pod.Name,
			PodPhase:     pod.Status.Phase,
			StartTime:    pod.Status.StartTime,
			PodIP:        pod.Status.PodIP,
			NodeName:     pod.Spec.NodeName,
			RestartCount: getRestartCount(pod),
		}
		if daemonSetMetricsByPod != nil {
			metric := daemonSetMetricsByPod.MetricsMap[pod.Name]
			podDetail.Metrics = &metric
			daemonSetDetail.HasMetrics = true
		}
		daemonSetDetail.Pods = append(daemonSetDetail.Pods, podDetail)
	}

	return daemonSetDetail, nil
}

// TODO(floreks): This should be transactional to make sure that DS will not be deleted without pods
// Deletes daemon set with given name in given namespace and related pods.
// Also deletes services related to daemon set if deleteServices is true.
func DeleteDaemonSet(client client.Interface, namespace, name string,
	deleteServices bool) error {

	log.Printf("Deleting %s daemon set from %s namespace", name, namespace)

	if deleteServices {
		if err := DeleteDaemonSetServices(client, namespace, name); err != nil {
			return err
		}
	}

	pods, err := getRawDaemonSetPods(client, namespace, name)
	if err != nil {
		return err
	}

	if err := client.Extensions().DaemonSets(namespace).Delete(name); err != nil {
		return err
	}

	for _, pod := range pods.Items {
		if err := client.Pods(namespace).Delete(pod.Name, &api.DeleteOptions{}); err != nil {
			return err
		}
	}

	log.Printf("Successfully deleted %s daemon set from %s namespace", name, namespace)

	return nil
}

// Deletes services related to daemon set with given name in given namespace.
func DeleteDaemonSetServices(client client.Interface, namespace, name string) error {
	log.Printf("Deleting services related to %s daemon set from %s namespace", name,
		namespace)

	daemonSet, err := client.Extensions().DaemonSets(namespace).Get(name)
	if err != nil {
		return err
	}

	labelSelector, err := unversioned.LabelSelectorAsSelector(daemonSet.Spec.Selector)
	if err != nil {
		return err
	}

	services, err := getServicesForDSDeletion(client, labelSelector, namespace)
	if err != nil {
		return err
	}

	for _, service := range services {
		if err := client.Services(namespace).Delete(service.Name); err != nil {
			return err
		}
	}

	log.Printf("Successfully deleted services related to %s daemon set from %s namespace",
		name, namespace)

	return nil
}

// Returns detailed information about service from given service
func getServiceDetailforDS(service api.Service, daemonSet extensions.DaemonSet,
	pods []api.Pod, getNodeFn GetNodeFunc) ServiceDetail {
	return ServiceDetail{
		Name: service.ObjectMeta.Name,
		InternalEndpoint: getInternalEndpoint(service.Name, service.Namespace,
			service.Spec.Ports),
		ExternalEndpoints: getExternalEndpointsforDS(daemonSet, pods, service, getNodeFn),
		Selector:          service.Spec.Selector,
	}
}

// Returns array of external endpoints for a daemon set.
func getExternalEndpointsforDS(daemonSet extensions.DaemonSet, pods []api.Pod,
	service api.Service, getNodeFn GetNodeFunc) []Endpoint {
	var externalEndpoints []Endpoint
	daemonSetPods := filterDaemonSetPods(daemonSet, pods)

	if service.Spec.Type == api.ServiceTypeNodePort {
		externalEndpoints = getNodePortEndpoints(daemonSetPods, service, getNodeFn)
	} else if service.Spec.Type == api.ServiceTypeLoadBalancer {
		for _, ingress := range service.Status.LoadBalancer.Ingress {
			externalEndpoints = append(externalEndpoints, getExternalEndpoint(ingress,
				service.Spec.Ports))
		}

		if len(externalEndpoints) == 0 {
			externalEndpoints = getNodePortEndpoints(daemonSetPods, service, getNodeFn)
		}
	}

	if len(externalEndpoints) == 0 && (service.Spec.Type == api.ServiceTypeNodePort ||
		service.Spec.Type == api.ServiceTypeLoadBalancer) {
		externalEndpoints = getLocalhostEndpoints(service)
	}

	return externalEndpoints
}

// Returns pods that belong to specified daemon set.
func filterDaemonSetPods(daemonSet extensions.DaemonSet,
	allPods []api.Pod) []api.Pod {
	var pods []api.Pod
	for _, pod := range allPods {
		if isLabelSelectorMatchingforDS(pod.Labels, daemonSet.Spec.Selector) {
			pods = append(pods, pod)
		}
	}
	return pods
}
