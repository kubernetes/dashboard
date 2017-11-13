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

package common

import (
	"github.com/kubernetes/dashboard/src/app/backend/api"
	apps "k8s.io/api/apps/v1beta2"
	autoscaling "k8s.io/api/autoscaling/v1"
	batch "k8s.io/api/batch/v1"
	batch2 "k8s.io/api/batch/v1beta1"
	"k8s.io/api/core/v1"
	extensions "k8s.io/api/extensions/v1beta1"
	rbac "k8s.io/api/rbac/v1"
	storage "k8s.io/api/storage/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	client "k8s.io/client-go/kubernetes"
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

	// List and error channels to Cron Jobs.
	CronJobList CronJobListChannel

	// List and error channels to Services.
	ServiceList ServiceListChannel

	// List and error channels to Endpoints.
	EndpointList EndpointListChannel

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

	// List and error channels to PersistentVolumes
	PersistentVolumeList PersistentVolumeListChannel

	// List and error channels to PersistentVolumeClaims
	PersistentVolumeClaimList PersistentVolumeClaimListChannel

	// List and error channels to ResourceQuotas
	ResourceQuotaList ResourceQuotaListChannel

	// List and error channels to HorizontalPodAutoscalers
	HorizontalPodAutoscalerList HorizontalPodAutoscalerListChannel

	// List and error channels to StorageClasses
	StorageClassList StorageClassListChannel

	// List and error channels to Roles
	RoleList RoleListChannel

	// List and error channels to ClusterRoles
	ClusterRoleList ClusterRoleListChannel

	// List and error channels to RoleBindings
	RoleBindingList RoleBindingListChannel

	// List and error channels to ClusterRoleBindings
	ClusterRoleBindingList ClusterRoleBindingListChannel
}

// ServiceListChannel is a list and error channels to Services.
type ServiceListChannel struct {
	List  chan *v1.ServiceList
	Error chan error
}

// GetServiceListChannel returns a pair of channels to a Service list and errors that both
// must be read numReads times.
func GetServiceListChannel(client client.Interface, nsQuery *NamespaceQuery,
	numReads int) ServiceListChannel {

	channel := ServiceListChannel{
		List:  make(chan *v1.ServiceList, numReads),
		Error: make(chan error, numReads),
	}
	go func() {
		list, err := client.CoreV1().Services(nsQuery.ToRequestParam()).List(api.ListEverything)
		var filteredItems []v1.Service
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

// GetIngressListChannel returns a pair of channels to an Ingress list and errors that both
// must be read numReads times.
func GetIngressListChannel(client client.Interface, nsQuery *NamespaceQuery,
	numReads int) IngressListChannel {

	channel := IngressListChannel{
		List:  make(chan *extensions.IngressList, numReads),
		Error: make(chan error, numReads),
	}
	go func() {
		list, err := client.ExtensionsV1beta1().Ingresses(nsQuery.ToRequestParam()).List(api.ListEverything)
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
	List  chan *v1.LimitRangeList
	Error chan error
}

// GetLimitRangeListChannel returns a pair of channels to a LimitRange list and errors that
// both must be read numReads times.
func GetLimitRangeListChannel(client client.Interface, nsQuery *NamespaceQuery,
	numReads int) LimitRangeListChannel {

	channel := LimitRangeListChannel{
		List:  make(chan *v1.LimitRangeList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.CoreV1().LimitRanges(nsQuery.ToRequestParam()).List(api.ListEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// NodeListChannel is a list and error channels to Nodes.
type NodeListChannel struct {
	List  chan *v1.NodeList
	Error chan error
}

// GetNodeListChannel returns a pair of channels to a Node list and errors that both must be read
// numReads times.
func GetNodeListChannel(client client.Interface, numReads int) NodeListChannel {
	channel := NodeListChannel{
		List:  make(chan *v1.NodeList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.CoreV1().Nodes().List(api.ListEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// NamespaceListChannel is a list and error channels to Namespaces.
type NamespaceListChannel struct {
	List  chan *v1.NamespaceList
	Error chan error
}

// GetNamespaceListChannel returns a pair of channels to a Namespace list and errors that both must
// be read
// numReads times.
func GetNamespaceListChannel(client client.Interface, numReads int) NamespaceListChannel {
	channel := NamespaceListChannel{
		List:  make(chan *v1.NamespaceList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.CoreV1().Namespaces().List(api.ListEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// EventListChannel is a list and error channels to Nodes.
type EventListChannel struct {
	List  chan *v1.EventList
	Error chan error
}

// GetEventListChannel returns a pair of channels to an Event list and errors that both must be read
// numReads times.
func GetEventListChannel(client client.Interface,
	nsQuery *NamespaceQuery, numReads int) EventListChannel {
	return GetEventListChannelWithOptions(client, nsQuery, api.ListEverything, numReads)
}

// GetEventListChannelWithOptions is GetEventListChannel plus list options.
func GetEventListChannelWithOptions(client client.Interface,
	nsQuery *NamespaceQuery, options metaV1.ListOptions, numReads int) EventListChannel {
	channel := EventListChannel{
		List:  make(chan *v1.EventList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.CoreV1().Events(nsQuery.ToRequestParam()).List(options)
		var filteredItems []v1.Event
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

// EndpointListChannel is a list and error channels to Endpoints.
type EndpointListChannel struct {
	List  chan *v1.EndpointsList
	Error chan error
}

func GetEndpointListChannel(client client.Interface, nsQuery *NamespaceQuery, numReads int) EndpointListChannel {
	return GetEndpointListChannelWithOptions(client, nsQuery, api.ListEverything, numReads)
}

// GetEndpointListChannelWithOptions is GetEndpointListChannel plus list options.
func GetEndpointListChannelWithOptions(client client.Interface,
	nsQuery *NamespaceQuery, opt metaV1.ListOptions, numReads int) EndpointListChannel {
	channel := EndpointListChannel{
		List:  make(chan *v1.EndpointsList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.CoreV1().Endpoints(nsQuery.ToRequestParam()).List(opt)

		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// PodListChannel is a list and error channels to Nodes.
type PodListChannel struct {
	List  chan *v1.PodList
	Error chan error
}

// GetPodListChannel returns a pair of channels to a Pod list and errors that both must be read
// numReads times.
func GetPodListChannel(client client.Interface,
	nsQuery *NamespaceQuery, numReads int) PodListChannel {
	return GetPodListChannelWithOptions(client, nsQuery, api.ListEverything, numReads)
}

// GetPodListChannelWithOptions is GetPodListChannel plus listing options.
func GetPodListChannelWithOptions(client client.Interface, nsQuery *NamespaceQuery,
	options metaV1.ListOptions, numReads int) PodListChannel {

	channel := PodListChannel{
		List:  make(chan *v1.PodList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.CoreV1().Pods(nsQuery.ToRequestParam()).List(options)
		var filteredItems []v1.Pod
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
	List  chan *v1.ReplicationControllerList
	Error chan error
}

// GetReplicationControllerListChannel Returns a pair of channels to a
// Replication Controller list and errors that both must be read
// numReads times.
func GetReplicationControllerListChannel(client client.Interface,
	nsQuery *NamespaceQuery, numReads int) ReplicationControllerListChannel {

	channel := ReplicationControllerListChannel{
		List:  make(chan *v1.ReplicationControllerList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.CoreV1().ReplicationControllers(nsQuery.ToRequestParam()).
			List(api.ListEverything)
		var filteredItems []v1.ReplicationController
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
	List  chan *apps.DeploymentList
	Error chan error
}

// GetDeploymentListChannel returns a pair of channels to a Deployment list and errors
// that both must be read numReads times.
func GetDeploymentListChannel(client client.Interface,
	nsQuery *NamespaceQuery, numReads int) DeploymentListChannel {

	channel := DeploymentListChannel{
		List:  make(chan *apps.DeploymentList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.AppsV1beta2().Deployments(nsQuery.ToRequestParam()).
			List(api.ListEverything)
		var filteredItems []apps.Deployment
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
	List  chan *apps.ReplicaSetList
	Error chan error
}

// GetReplicaSetListChannel returns a pair of channels to a ReplicaSet list and
// errors that both must be read numReads times.
func GetReplicaSetListChannel(client client.Interface,
	nsQuery *NamespaceQuery, numReads int) ReplicaSetListChannel {
	return GetReplicaSetListChannelWithOptions(client, nsQuery, api.ListEverything, numReads)
}

// GetReplicaSetListChannelWithOptions returns a pair of channels to a ReplicaSet list filtered
// by provided options and errors that both must be read numReads times.
func GetReplicaSetListChannelWithOptions(client client.Interface, nsQuery *NamespaceQuery,
	options metaV1.ListOptions, numReads int) ReplicaSetListChannel {
	channel := ReplicaSetListChannel{
		List:  make(chan *apps.ReplicaSetList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.AppsV1beta2().ReplicaSets(nsQuery.ToRequestParam()).
			List(options)
		var filteredItems []apps.ReplicaSet
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
	List  chan *apps.DaemonSetList
	Error chan error
}

// GetDaemonSetListChannel returns a pair of channels to a DaemonSet list and errors that both must be read
// numReads times.
func GetDaemonSetListChannel(client client.Interface, nsQuery *NamespaceQuery, numReads int) DaemonSetListChannel {
	channel := DaemonSetListChannel{
		List:  make(chan *apps.DaemonSetList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.AppsV1beta2().DaemonSets(nsQuery.ToRequestParam()).List(api.ListEverything)
		var filteredItems []apps.DaemonSet
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

// GetJobListChannel returns a pair of channels to a Job list and errors that both must be read numReads times.
func GetJobListChannel(client client.Interface,
	nsQuery *NamespaceQuery, numReads int) JobListChannel {
	channel := JobListChannel{
		List:  make(chan *batch.JobList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.BatchV1().Jobs(nsQuery.ToRequestParam()).List(api.ListEverything)
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

// CronJobListChannel is a list and error channels to Cron Jobs.
type CronJobListChannel struct {
	List  chan *batch2.CronJobList
	Error chan error
}

// GetCronJobListChannel returns a pair of channels to a Cron Job list and errors that both must be read numReads times.
func GetCronJobListChannel(client client.Interface, nsQuery *NamespaceQuery, numReads int) CronJobListChannel {
	channel := CronJobListChannel{
		List:  make(chan *batch2.CronJobList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.BatchV1beta1().CronJobs(nsQuery.ToRequestParam()).List(api.ListEverything)
		var filteredItems []batch2.CronJob
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

// GetStatefulSetListChannel returns a pair of channels to a StatefulSet list and errors that both must be read
// numReads times.
func GetStatefulSetListChannel(client client.Interface,
	nsQuery *NamespaceQuery, numReads int) StatefulSetListChannel {
	channel := StatefulSetListChannel{
		List:  make(chan *apps.StatefulSetList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		statefulSets, err := client.AppsV1beta2().StatefulSets(nsQuery.ToRequestParam()).List(api.ListEverything)
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
	List  chan *v1.ConfigMapList
	Error chan error
}

// GetConfigMapListChannel returns a pair of channels to a ConfigMap list and errors that both must be read
// numReads times.
func GetConfigMapListChannel(client client.Interface, nsQuery *NamespaceQuery,
	numReads int) ConfigMapListChannel {

	channel := ConfigMapListChannel{
		List:  make(chan *v1.ConfigMapList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.CoreV1().ConfigMaps(nsQuery.ToRequestParam()).List(api.ListEverything)
		var filteredItems []v1.ConfigMap
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
	List  chan *v1.SecretList
	Error chan error
}

// GetSecretListChannel returns a pair of channels to a Secret list and errors that
// both must be read numReads times.
func GetSecretListChannel(client client.Interface, nsQuery *NamespaceQuery,
	numReads int) SecretListChannel {

	channel := SecretListChannel{
		List:  make(chan *v1.SecretList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.CoreV1().Secrets(nsQuery.ToRequestParam()).List(api.ListEverything)
		var filteredItems []v1.Secret
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

// RoleListChannel is a list and error channels to Roles.
type RoleListChannel struct {
	List  chan *rbac.RoleList
	Error chan error
}

// GetRoleListChannel returns a pair of channels to a Role list for a namespace and errors that
// both must be read numReads times.
func GetRoleListChannel(client client.Interface, numReads int) RoleListChannel {
	channel := RoleListChannel{
		List:  make(chan *rbac.RoleList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.RbacV1().Roles("").List(api.ListEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// ClusterRoleListChannel is a list and error channels to ClusterRoles.
type ClusterRoleListChannel struct {
	List  chan *rbac.ClusterRoleList
	Error chan error
}

// GetClusterRoleListChannel returns a pair of channels to a ClusterRole list and errors that
// both must be read numReads times.
func GetClusterRoleListChannel(client client.Interface, numReads int) ClusterRoleListChannel {
	channel := ClusterRoleListChannel{
		List:  make(chan *rbac.ClusterRoleList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.RbacV1().ClusterRoles().List(api.ListEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// RoleBindingListChannel is a list and error channels to RoleBindings.
type RoleBindingListChannel struct {
	List  chan *rbac.RoleBindingList
	Error chan error
}

// GetRoleBindingListChannel returns a pair of channels to a RoleBinding list for a namespace and errors that
// both must be read numReads times.
func GetRoleBindingListChannel(client client.Interface, numReads int) RoleBindingListChannel {
	channel := RoleBindingListChannel{
		List:  make(chan *rbac.RoleBindingList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.RbacV1().RoleBindings("").List(api.ListEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// ClusterRoleBindingListChannel is a list and error channels to ClusterRoleBindings.
type ClusterRoleBindingListChannel struct {
	List  chan *rbac.ClusterRoleBindingList
	Error chan error
}

// GetClusterRoleBindingListChannel returns a pair of channels to a ClusterRoleBinding list and
// errors that both must be read numReads times.
func GetClusterRoleBindingListChannel(client client.Interface,
	numReads int) ClusterRoleBindingListChannel {
	channel := ClusterRoleBindingListChannel{
		List:  make(chan *rbac.ClusterRoleBindingList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.RbacV1().ClusterRoleBindings().List(api.ListEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// PersistentVolumeListChannel is a list and error channels to PersistentVolumes.
type PersistentVolumeListChannel struct {
	List  chan *v1.PersistentVolumeList
	Error chan error
}

// GetPersistentVolumeListChannel returns a pair of channels to a PersistentVolume list and errors
// that both must be read numReads times.
func GetPersistentVolumeListChannel(client client.Interface,
	numReads int) PersistentVolumeListChannel {
	channel := PersistentVolumeListChannel{
		List:  make(chan *v1.PersistentVolumeList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.CoreV1().PersistentVolumes().List(api.ListEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// PersistentVolumeClaimListChannel is a list and error channels to PersistentVolumeClaims.
type PersistentVolumeClaimListChannel struct {
	List  chan *v1.PersistentVolumeClaimList
	Error chan error
}

// GetPersistentVolumeClaimListChannel returns a pair of channels to a PersistentVolumeClaim list
// and errors that both must be read numReads times.
func GetPersistentVolumeClaimListChannel(client client.Interface, nsQuery *NamespaceQuery,
	numReads int) PersistentVolumeClaimListChannel {

	channel := PersistentVolumeClaimListChannel{
		List:  make(chan *v1.PersistentVolumeClaimList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.CoreV1().PersistentVolumeClaims(nsQuery.ToRequestParam()).List(api.ListEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// ResourceQuotaListChannel is a list and error channels to ResourceQuotas.
type ResourceQuotaListChannel struct {
	List  chan *v1.ResourceQuotaList
	Error chan error
}

// GetResourceQuotaListChannel returns a pair of channels to a ResourceQuota list and errors that
// both must be read numReads times.
func GetResourceQuotaListChannel(client client.Interface, nsQuery *NamespaceQuery,
	numReads int) ResourceQuotaListChannel {

	channel := ResourceQuotaListChannel{
		List:  make(chan *v1.ResourceQuotaList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.CoreV1().ResourceQuotas(nsQuery.ToRequestParam()).List(api.ListEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// HorizontalPodAutoscalerListChannel is a list and error channels.
type HorizontalPodAutoscalerListChannel struct {
	List  chan *autoscaling.HorizontalPodAutoscalerList
	Error chan error
}

// GetPodListMetricsChannel returns a pair of channels to MetricsByPod and errors that
// both must be read numReads times.
func GetHorizontalPodAutoscalerListChannel(client client.Interface, nsQuery *NamespaceQuery,
	numReads int) HorizontalPodAutoscalerListChannel {
	channel := HorizontalPodAutoscalerListChannel{
		List:  make(chan *autoscaling.HorizontalPodAutoscalerList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.AutoscalingV1().HorizontalPodAutoscalers(nsQuery.ToRequestParam()).
			List(api.ListEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}

// StorageClassListChannel is a list and error channels to storage classes.
type StorageClassListChannel struct {
	List  chan *storage.StorageClassList
	Error chan error
}

// GetStorageClassListChannel returns a pair of channels to a storage class list and
// errors that both must be read numReads times.
func GetStorageClassListChannel(client client.Interface, numReads int) StorageClassListChannel {
	channel := StorageClassListChannel{
		List:  make(chan *storage.StorageClassList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		list, err := client.StorageV1().StorageClasses().List(api.ListEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- list
			channel.Error <- err
		}
	}()

	return channel
}
