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

package common

import (
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/apis/apps"
	"k8s.io/kubernetes/pkg/apis/autoscaling"
	"k8s.io/kubernetes/pkg/apis/batch"
	"k8s.io/kubernetes/pkg/apis/extensions"
	client "k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"

	kdClient "github.com/kubernetes/dashboard/src/app/backend/client"
)

// ResourceChannels struct holds channels to resource lists. Each list channel is paired with
// an error channel which *must* be read sequentially: first read the list channel and then
// the error channel.
//
// This struct can be used when there are multiple clients that want to process, e.g., a
// list of pods. With this helper, the list can be read only once from the backend and
// distributed asynchronously to clients that need it.
//
// When a channel is nil, it means that no resource list is available for getting.
//
// Each channel pair can be read up to N times. N is specified upon creation of the channels.
type ResourceChannels struct {
	// List and error channels to Replication Controllers.
	ReplicationControllerList ReplicationControllerListChannel

	// List and error channels to Replica Sets.
	ReplicaSetList ReplicaSetListChannel

	// List and error channels to Deployments.
	DeploymentList DeploymentListChannel

	// List and error channels to Daemon Sets.
	DaemonSetList DaemonSetListChannel

	// List and error channels to Jobs.
	JobList JobListChannel

	// List and error channels to Services.
	ServiceList ServiceListChannel

	// List and error channels to Ingresses.
	IngressList IngressListChannel

	// List and error channels to Pods.
	PodList PodListChannel

	// List and error channels to Events.
	EventList EventListChannel

	// List and error channels to LimitRanges.
	LimitRangeList LimitRangeListChannel

	// List and error channels to Nodes.
	NodeList NodeListChannel

	// List and error channels to Namespaces.
	NamespaceList NamespaceListChannel

	// List and error channels to StatefulSets.
	StatefulSetList StatefulSetListChannel

	// List and error channels to ConfigMaps.
	ConfigMapList ConfigMapListChannel

	// List and error channels to Secrets.
	SecretList SecretListChannel

	// List and error channels to PodMetrics.
	PodMetrics PodMetricsChannel

	// List and error channels to PersistentVolumes
	PersistentVolumeList PersistentVolumeListChannel

	// List and error channels to PersistentVolumeClaims
	PersistentVolumeClaimList PersistentVolumeClaimListChannel

	// List and error channels to ResourceQuotas
	ResourceQuotaList ResourceQuotaListChannel

	// List and error channels to HorizontalPodAutoscalers
	HorizontalPodAutoscalerList HorizontalPodAutoscalerListChannel
}

// ServiceListChannel is a list and error channels to Services.
type ServiceListChannel struct {
	List  chan *api.ServiceList
	Error chan error
}

// GetServiceListChannel returns a pair of channels to a Service list and errors that both
// must be read numReads times.
func GetServiceListChannel(client client.Interface,
	nsQuery *NamespaceQuery, numReads int) ServiceListChannel {

	channel := ServiceListChannel{
		List:  make(chan *api.ServiceList, numReads),
		Error: make(chan error, numReads),
	}
	go func() {
		list, err := client.Core().Services(nsQuery.ToRequestParam()).List(listEverything)
		var filteredItems []api.Service
		for _, item := range list.Items {
			if nsQuery.Matches(item.ObjectMeta.Namespace) {
				filteredItems = append(filteredItems, item)
			}
		}
		list.Items = filteredItems
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// IngressListChannel is a list and error channels to Ingresss.
type IngressListChannel struct {
	List  chan *extensions.IngressList
	Error chan error
}

// GetIngressListChannel returns a pair of channels to a Ingress list and errors that both
// must be read numReads times.
func GetIngressListChannel(client client.Interface, nsQuery *NamespaceQuery,
	numReads int) IngressListChannel {

	channel := IngressListChannel{
		List:  make(chan *extensions.IngressList, numReads),
		Error: make(chan error, numReads),
	}
	go func() {
		list, err := client.Extensions().Ingresses(nsQuery.ToRequestParam()).List(listEverything)
		var filteredItems []extensions.Ingress
		for _, item := range list.Items {
			if nsQuery.Matches(item.ObjectMeta.Namespace) {
				filteredItems = append(filteredItems, item)
			}
		}
		list.Items = filteredItems
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// LimitRangeListChannel is a list and error channels to LimitRanges.
type LimitRangeListChannel struct {
	List  chan *api.LimitRangeList
	Error chan error
}

// GetLimitRangeListChannel returns a pair of channels to a LimitRange list and errors that
// both must be read numReads times.
func GetLimitRangeListChannel(client client.Interface, nsQuery *NamespaceQuery,
	numReads int) LimitRangeListChannel {

	channel := LimitRangeListChannel{
		List:  make(chan *api.LimitRangeList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.Core().LimitRanges(nsQuery.ToRequestParam()).List(listEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// NodeListChannel is a list and error channels to Nodes.
type NodeListChannel struct {
	List  chan *api.NodeList
	Error chan error
}

// GetNodeListChannel returns a pair of channels to a Node list and errors that both must be read
// numReads times.
func GetNodeListChannel(client client.Interface, numReads int) NodeListChannel {
	channel := NodeListChannel{
		List:  make(chan *api.NodeList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.Core().Nodes().List(listEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// NamespaceListChannel is a list and error channels to Namespaces.
type NamespaceListChannel struct {
	List  chan *api.NamespaceList
	Error chan error
}

// GetNamespaceListChannel returns a pair of channels to a Namespace list and errors that both must be read
// numReads times.
func GetNamespaceListChannel(client client.Interface, numReads int) NamespaceListChannel {
	channel := NamespaceListChannel{
		List:  make(chan *api.NamespaceList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.Core().Namespaces().List(listEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// EventListChannel is a list and error channels to Nodes.
type EventListChannel struct {
	List  chan *api.EventList
	Error chan error
}

// GetEventListChannel returns a pair of channels to an Event list and errors that both must be read
// numReads times.
func GetEventListChannel(client client.Interface,
	nsQuery *NamespaceQuery, numReads int) EventListChannel {
	return GetEventListChannelWithOptions(client, nsQuery, listEverything, numReads)
}

// GetEventListChannelWithOptions is GetEventListChannel plus list options.
func GetEventListChannelWithOptions(client client.Interface,
	nsQuery *NamespaceQuery, options api.ListOptions, numReads int) EventListChannel {
	channel := EventListChannel{
		List:  make(chan *api.EventList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.Core().Events(nsQuery.ToRequestParam()).List(options)
		var filteredItems []api.Event
		for _, item := range list.Items {
			if nsQuery.Matches(item.ObjectMeta.Namespace) {
				filteredItems = append(filteredItems, item)
			}
		}
		list.Items = filteredItems
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// PodListChannel is a list and error channels to Nodes.
type PodListChannel struct {
	List  chan *api.PodList
	Error chan error
}

// GetPodListChannel returns a pair of channels to a Pod list and errors that both must be read
// numReads times.
func GetPodListChannel(client client.Interface,
	nsQuery *NamespaceQuery, numReads int) PodListChannel {
	return GetPodListChannelWithOptions(client, nsQuery, listEverything, numReads)
}

// GetPodListChannelWithOptions is GetPodListChannel plus listing options.
func GetPodListChannelWithOptions(client client.Interface, nsQuery *NamespaceQuery,
	options api.ListOptions, numReads int) PodListChannel {

	channel := PodListChannel{
		List:  make(chan *api.PodList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.Core().Pods(nsQuery.ToRequestParam()).List(options)
		var filteredItems []api.Pod
		for _, item := range list.Items {
			if nsQuery.Matches(item.ObjectMeta.Namespace) {
				filteredItems = append(filteredItems, item)
			}
		}
		list.Items = filteredItems
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// ReplicationControllerListChannel is a list and error channels to Nodes.
type ReplicationControllerListChannel struct {
	List  chan *api.ReplicationControllerList
	Error chan error
}

// GetReplicationControllerListChannel Returns a pair of channels to a
// Replication Controller list and errors that both must be read
// numReads times.
func GetReplicationControllerListChannel(client client.Interface,
	nsQuery *NamespaceQuery, numReads int) ReplicationControllerListChannel {

	channel := ReplicationControllerListChannel{
		List:  make(chan *api.ReplicationControllerList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.Core().ReplicationControllers(nsQuery.ToRequestParam()).List(listEverything)
		var filteredItems []api.ReplicationController
		for _, item := range list.Items {
			if nsQuery.Matches(item.ObjectMeta.Namespace) {
				filteredItems = append(filteredItems, item)
			}
		}
		list.Items = filteredItems
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// DeploymentListChannel is a list and error channels to Deployments.
type DeploymentListChannel struct {
	List  chan *extensions.DeploymentList
	Error chan error
}

// GetDeploymentListChannel returns a pair of channels to a Deployment list and errors
// that both must be read numReads times.
func GetDeploymentListChannel(client client.Interface,
	nsQuery *NamespaceQuery, numReads int) DeploymentListChannel {

	channel := DeploymentListChannel{
		List:  make(chan *extensions.DeploymentList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.Extensions().Deployments(nsQuery.ToRequestParam()).List(listEverything)
		var filteredItems []extensions.Deployment
		for _, item := range list.Items {
			if nsQuery.Matches(item.ObjectMeta.Namespace) {
				filteredItems = append(filteredItems, item)
			}
		}
		list.Items = filteredItems
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// ReplicaSetListChannel is a list and error channels to Replica Sets.
type ReplicaSetListChannel struct {
	List  chan *extensions.ReplicaSetList
	Error chan error
}

// GetReplicaSetListChannel returns a pair of channels to a ReplicaSet list and
// errors that both must be read numReads times.
func GetReplicaSetListChannel(client client.Interface,
	nsQuery *NamespaceQuery, numReads int) ReplicaSetListChannel {
	return GetReplicaSetListChannelWithOptions(client, nsQuery, listEverything, numReads)
}

// GetReplicaSetListChannelWithOptions returns a pair of channels to a ReplicaSet list filtered
// by provided options and errors that both must be read numReads times.
func GetReplicaSetListChannelWithOptions(client client.Interface,
	nsQuery *NamespaceQuery, options api.ListOptions, numReads int) ReplicaSetListChannel {
	channel := ReplicaSetListChannel{
		List:  make(chan *extensions.ReplicaSetList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.Extensions().ReplicaSets(nsQuery.ToRequestParam()).List(options)
		var filteredItems []extensions.ReplicaSet
		for _, item := range list.Items {
			if nsQuery.Matches(item.ObjectMeta.Namespace) {
				filteredItems = append(filteredItems, item)
			}
		}
		list.Items = filteredItems
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// DaemonSetListChannel is a list and error channels to Nodes.
type DaemonSetListChannel struct {
	List  chan *extensions.DaemonSetList
	Error chan error
}

// GetDaemonSetListChannel returns a pair of channels to a DaemonSet list and errors that
// both must be read numReads times.
func GetDaemonSetListChannel(client client.Interface,
	nsQuery *NamespaceQuery, numReads int) DaemonSetListChannel {
	channel := DaemonSetListChannel{
		List:  make(chan *extensions.DaemonSetList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.Extensions().DaemonSets(nsQuery.ToRequestParam()).List(listEverything)
		var filteredItems []extensions.DaemonSet
		for _, item := range list.Items {
			if nsQuery.Matches(item.ObjectMeta.Namespace) {
				filteredItems = append(filteredItems, item)
			}
		}
		list.Items = filteredItems
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// JobListChannel is a list and error channels to Nodes.
type JobListChannel struct {
	List  chan *batch.JobList
	Error chan error
}

// GetJobListChannel returns a pair of channels to a Job list and errors that
// both must be read numReads times.
func GetJobListChannel(client client.Interface,
	nsQuery *NamespaceQuery, numReads int) JobListChannel {
	channel := JobListChannel{
		List:  make(chan *batch.JobList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.Batch().Jobs(nsQuery.ToRequestParam()).List(listEverything)
		var filteredItems []batch.Job
		for _, item := range list.Items {
			if nsQuery.Matches(item.ObjectMeta.Namespace) {
				filteredItems = append(filteredItems, item)
			}
		}
		list.Items = filteredItems
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// StatefulSetListChannel is a list and error channels to Nodes.
type StatefulSetListChannel struct {
	List  chan *apps.StatefulSetList
	Error chan error
}

// GetStatefulSetListChannel returns a pair of channels to a StatefulSet list and errors that
// both must be read numReads times.
func GetStatefulSetListChannel(client client.Interface,
	nsQuery *NamespaceQuery, numReads int) StatefulSetListChannel {
	channel := StatefulSetListChannel{
		List:  make(chan *apps.StatefulSetList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		statefulSets, err := client.Apps().StatefulSets(nsQuery.ToRequestParam()).List(listEverything)
		var filteredItems []apps.StatefulSet
		for _, item := range statefulSets.Items {
			if nsQuery.Matches(item.ObjectMeta.Namespace) {
				filteredItems = append(filteredItems, item)
			}
		}
		statefulSets.Items = filteredItems
		for i := 0; i < numReads; i++ {
			channel.List <- statefulSets
			channel.Error <- err
		}
	}()

	return channel
}

// ConfigMapListChannel is a list and error channels to ConfigMaps.
type ConfigMapListChannel struct {
	List  chan *api.ConfigMapList
	Error chan error
}

// GetConfigMapListChannel returns a pair of channels to a ConfigMap list and errors that
// both must be read numReads times.
func GetConfigMapListChannel(client client.Interface, nsQuery *NamespaceQuery, numReads int) ConfigMapListChannel {

	channel := ConfigMapListChannel{
		List:  make(chan *api.ConfigMapList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.Core().ConfigMaps(nsQuery.ToRequestParam()).List(listEverything)
		var filteredItems []api.ConfigMap
		for _, item := range list.Items {
			if nsQuery.Matches(item.ObjectMeta.Namespace) {
				filteredItems = append(filteredItems, item)
			}
		}
		list.Items = filteredItems
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// SecretListChannel is a list and error channels to Secrets.
type SecretListChannel struct {
	List  chan *api.SecretList
	Error chan error
}

// GetSecretListChannel returns a pair of channels to a Secret list and errors that
// both must be read numReads times.
func GetSecretListChannel(client client.Interface, nsQuery *NamespaceQuery, numReads int) SecretListChannel {

	channel := SecretListChannel{
		List:  make(chan *api.SecretList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.Core().Secrets(nsQuery.ToRequestParam()).List(listEverything)
		var filteredItems []api.Secret
		for _, item := range list.Items {
			if nsQuery.Matches(item.ObjectMeta.Namespace) {
				filteredItems = append(filteredItems, item)
			}
		}
		list.Items = filteredItems
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// PersistentVolumeListChannel is a list and error channels to PersistentVolumes.
type PersistentVolumeListChannel struct {
	List  chan *api.PersistentVolumeList
	Error chan error
}

// GetPersistentVolumeListChannel returns a pair of channels to a PersistentVolume list and errors that
// both must be read numReads times.
func GetPersistentVolumeListChannel(client client.Interface, numReads int) PersistentVolumeListChannel {
	channel := PersistentVolumeListChannel{
		List:  make(chan *api.PersistentVolumeList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.Core().PersistentVolumes().List(listEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// PersistentVolumeClaimListChannel is a list and error channels to PersistentVolumeClaims.
type PersistentVolumeClaimListChannel struct {
	List  chan *api.PersistentVolumeClaimList
	Error chan error
}

// GetPersistentVolumeClaimListChannel returns a pair of channels to a PersistentVolumeClaim list and errors that
// both must be read numReads times.
func GetPersistentVolumeClaimListChannel(client client.Interface, nsQuery *NamespaceQuery,
	numReads int) PersistentVolumeClaimListChannel {

	channel := PersistentVolumeClaimListChannel{
		List:  make(chan *api.PersistentVolumeClaimList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.Core().PersistentVolumeClaims(nsQuery.ToRequestParam()).List(listEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// ResourceQuotaListChannel is a list and error channels to ResourceQuotas.
type ResourceQuotaListChannel struct {
	List  chan *api.ResourceQuotaList
	Error chan error
}

// GetResourceQuotaListChannel returns a pair of channels to a ResourceQuota list and errors that
// both must be read numReads times.
func GetResourceQuotaListChannel(client client.Interface, nsQuery *NamespaceQuery,
	numReads int) ResourceQuotaListChannel {

	channel := ResourceQuotaListChannel{
		List:  make(chan *api.ResourceQuotaList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.Core().ResourceQuotas(nsQuery.ToRequestParam()).List(listEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// PodMetricsChannel is a list and error channels to MetricsByPod.
type PodMetricsChannel struct {
	MetricsByPod chan *MetricsByPod
	Error        chan error
}

// GetPodListMetricsChannel returns a pair of channels to MetricsByPod and errors that
// both must be read numReads times.
func GetPodListMetricsChannel(heapsterClient kdClient.HeapsterClient, pods []api.Pod, numReads int) PodMetricsChannel {
	channel := PodMetricsChannel{
		MetricsByPod: make(chan *MetricsByPod, numReads),
		Error:        make(chan error, numReads),
	}

	go func() {
		podNamesByNamespace := make(map[string][]string)
		for _, pod := range pods {
			podNamesByNamespace[pod.ObjectMeta.Namespace] =
				append(podNamesByNamespace[pod.ObjectMeta.Namespace], pod.Name)
		}

		metrics, err := getPodListMetrics(podNamesByNamespace, heapsterClient)
		for i := 0; i < numReads; i++ {
			channel.MetricsByPod <- metrics
			channel.Error <- err
		}
	}()

	return channel
}

// GetPodMetricsChannel returns a pair of channels to MetricsByPod and errors that
// both must be read 1 time.
func GetPodMetricsChannel(heapsterClient kdClient.HeapsterClient, name string, namespace string) PodMetricsChannel {
	channel := PodMetricsChannel{
		MetricsByPod: make(chan *MetricsByPod, 1),
		Error:        make(chan error, 1),
	}

	go func() {
		podNamesByNamespace := map[string][]string{namespace: []string{name}}
		metrics, err := getPodListMetrics(podNamesByNamespace, heapsterClient)
		channel.MetricsByPod <- metrics
		channel.Error <- err
	}()

	return channel
}

// PodMetricsChannel is a list and error channels to MetricsByPod.
type HorizontalPodAutoscalerListChannel struct {
	List  chan *autoscaling.HorizontalPodAutoscalerList
	Error chan error
}

// GetPodListMetricsChannel returns a pair of channels to MetricsByPod and errors that
// both must be read numReads times.
func GetHorizontalPodAutoscalerListChannel(client client.Interface, nsQuery *NamespaceQuery, numReads int) HorizontalPodAutoscalerListChannel {
	channel := HorizontalPodAutoscalerListChannel{
		List:  make(chan *autoscaling.HorizontalPodAutoscalerList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.Autoscaling().HorizontalPodAutoscalers(nsQuery.ToRequestParam()).List(listEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

var listEverything = api.ListOptions{
	LabelSelector: labels.Everything(),
	FieldSelector: fields.Everything(),
}
