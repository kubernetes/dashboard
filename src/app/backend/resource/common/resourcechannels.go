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
	"k8s.io/kubernetes/pkg/apis/batch"
	"k8s.io/kubernetes/pkg/apis/extensions"
	client "k8s.io/kubernetes/pkg/client/unversioned"
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

	// List and error channels to Pods.
	PodList PodListChannel

	// List and error channels to Events.
	EventList EventListChannel

	// List and error channels to Nodes.
	NodeList NodeListChannel

	// List and error channels to PetSets.
	PetSetList PetSetListChannel

	// List and error channels to PetSets.
	ConfigMapList ConfigMapListChannel

	// List and error channels to PodMetrics.
	PodMetrics PodMetricsChannel

	// List and error channels to PersistentVolumes
	PersistentVolumeList PersistentVolumeListChannel

	// List and error channels to PersistentVolumeClaims
	PersistentVolumeClaimList PersistentVolumeClaimListChannel
}

// ServiceListChannel is a list and error channels to Services.
type ServiceListChannel struct {
	List  chan *api.ServiceList
	Error chan error
}

// GetServiceListChannel returns a pair of channels to a Service list and errors that both
// must be read numReads times.
func GetServiceListChannel(client client.ServicesNamespacer,
	nsQuery *NamespaceQuery, numReads int) ServiceListChannel {

	channel := ServiceListChannel{
		List:  make(chan *api.ServiceList, numReads),
		Error: make(chan error, numReads),
	}
	go func() {
		list, err := client.Services(nsQuery.ToRequestParam()).List(listEverything)
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

// NodeListChannel is a list and error channels to Nodes.
type NodeListChannel struct {
	List  chan *api.NodeList
	Error chan error
}

// GetNodeListChannel returns a pair of channels to a Node list and errors that both must be read
// numReads times.
func GetNodeListChannel(client client.NodesInterface, numReads int) NodeListChannel {
	channel := NodeListChannel{
		List:  make(chan *api.NodeList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.Nodes().List(listEverything)
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
func GetEventListChannel(client client.EventNamespacer,
	nsQuery *NamespaceQuery, numReads int) EventListChannel {
	return GetEventListChannelWithOptions(client, nsQuery, listEverything, numReads)
}

// GetEventListChannelWithOptions is GetEventListChannel plus list options.
func GetEventListChannelWithOptions(client client.EventNamespacer,
	nsQuery *NamespaceQuery, options api.ListOptions, numReads int) EventListChannel {
	channel := EventListChannel{
		List:  make(chan *api.EventList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.Events(nsQuery.ToRequestParam()).List(options)
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
func GetPodListChannel(client client.PodsNamespacer,
	nsQuery *NamespaceQuery, numReads int) PodListChannel {
	return GetPodListChannelWithOptions(client, nsQuery, listEverything, numReads)
}

// GetPodListChannelWithOptions is GetPodListChannel plus listing options.
func GetPodListChannelWithOptions(client client.PodsNamespacer, nsQuery *NamespaceQuery,
	options api.ListOptions, numReads int) PodListChannel {

	channel := PodListChannel{
		List:  make(chan *api.PodList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.Pods(nsQuery.ToRequestParam()).List(options)
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
func GetReplicationControllerListChannel(client client.ReplicationControllersNamespacer,
	nsQuery *NamespaceQuery, numReads int) ReplicationControllerListChannel {

	channel := ReplicationControllerListChannel{
		List:  make(chan *api.ReplicationControllerList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.ReplicationControllers(nsQuery.ToRequestParam()).List(listEverything)
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
func GetDeploymentListChannel(client client.DeploymentsNamespacer,
	nsQuery *NamespaceQuery, numReads int) DeploymentListChannel {

	channel := DeploymentListChannel{
		List:  make(chan *extensions.DeploymentList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.Deployments(nsQuery.ToRequestParam()).List(listEverything)
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
func GetReplicaSetListChannel(client client.ReplicaSetsNamespacer,
	nsQuery *NamespaceQuery, numReads int) ReplicaSetListChannel {
	return GetReplicaSetListChannelWithOptions(client, nsQuery, listEverything, numReads)
}

// GetReplicaSetListChannelWithOptions returns a pair of channels to a ReplicaSet list filtered
// by provided options and errors that both must be read numReads times.
func GetReplicaSetListChannelWithOptions(client client.ReplicaSetsNamespacer,
	nsQuery *NamespaceQuery, options api.ListOptions, numReads int) ReplicaSetListChannel {
	channel := ReplicaSetListChannel{
		List:  make(chan *extensions.ReplicaSetList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.ReplicaSets(nsQuery.ToRequestParam()).List(options)
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
func GetDaemonSetListChannel(client client.DaemonSetsNamespacer,
	nsQuery *NamespaceQuery, numReads int) DaemonSetListChannel {
	channel := DaemonSetListChannel{
		List:  make(chan *extensions.DaemonSetList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.DaemonSets(nsQuery.ToRequestParam()).List(listEverything)
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
func GetJobListChannel(client client.JobsNamespacer,
	nsQuery *NamespaceQuery, numReads int) JobListChannel {
	channel := JobListChannel{
		List:  make(chan *batch.JobList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.Jobs(nsQuery.ToRequestParam()).List(listEverything)
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

// PetSetListChannel is a list and error channels to Nodes.
type PetSetListChannel struct {
	List  chan *apps.PetSetList
	Error chan error
}

// GetPetSetListChannel returns a pair of channels to a PetSet list and errors that
// both must be read numReads times.
func GetPetSetListChannel(client client.PetSetNamespacer,
	nsQuery *NamespaceQuery, numReads int) PetSetListChannel {
	channel := PetSetListChannel{
		List:  make(chan *apps.PetSetList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		petSets, err := client.PetSets(nsQuery.ToRequestParam()).List(listEverything)
		var filteredItems []apps.PetSet
		for _, item := range petSets.Items {
			if nsQuery.Matches(item.ObjectMeta.Namespace) {
				filteredItems = append(filteredItems, item)
			}
		}
		petSets.Items = filteredItems
		for i := 0; i < numReads; i++ {
			channel.List <- petSets
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
func GetConfigMapListChannel(client client.ConfigMapsNamespacer, nsQuery *NamespaceQuery, numReads int) ConfigMapListChannel {

	channel := ConfigMapListChannel{
		List:  make(chan *api.ConfigMapList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.ConfigMaps(nsQuery.ToRequestParam()).List(listEverything)
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

// PersistentVolumeListChannel is a list and error channels to PersistentVolumes.
type PersistentVolumeListChannel struct {
	List  chan *api.PersistentVolumeList
	Error chan error
}

// GetPersistentVolumeListChannel returns a pair of channels to a PersistentVolume list and errors that
// both must be read numReads times.
func GetPersistentVolumeListChannel(client client.PersistentVolumesInterface, numReads int) PersistentVolumeListChannel {
	channel := PersistentVolumeListChannel{
		List:  make(chan *api.PersistentVolumeList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.PersistentVolumes().List(listEverything)
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
func GetPersistentVolumeClaimListChannel(client client.PersistentVolumeClaimsNamespacer, nsQuery *NamespaceQuery, numReads int) PersistentVolumeClaimListChannel {
	channel := PersistentVolumeClaimListChannel{
		List:  make(chan *api.PersistentVolumeClaimList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.PersistentVolumeClaims(nsQuery.ToRequestParam()).List(listEverything)
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

var listEverything = api.ListOptions{
	LabelSelector: labels.Everything(),
	FieldSelector: fields.Everything(),
}
