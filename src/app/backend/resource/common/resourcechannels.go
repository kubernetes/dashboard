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
	"k8s.io/kubernetes/pkg/apis/extensions"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
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

	// List and error channels to Services.
	ServiceList ServiceListChannel

	// List and error channels to Pods.
	PodList PodListChannel

	// List and error channels to Events.
	EventList EventListChannel

	// List and error channels to Nodes.
	NodeList NodeListChannel
}

// List and error channels to Services.
type ServiceListChannel struct {
	List  chan *api.ServiceList
	Error chan error
}

var listEverything api.ListOptions = api.ListOptions{
	LabelSelector: labels.Everything(),
	FieldSelector: fields.Everything(),
}

// Returns a pair of channels to a Service list and errors that both must be read
// numReads times.
func GetServiceListChannel(client client.ServicesNamespacer, numReads int) ServiceListChannel {
	channel := ServiceListChannel{
		List:  make(chan *api.ServiceList, numReads),
		Error: make(chan error, numReads),
	}
	go func() {
		services, err := client.Services(api.NamespaceAll).List(listEverything)

		for i := 0; i < numReads; i++ {
			channel.List <- services
			channel.Error <- err
		}
	}()

	return channel
}

// List and error channels to Nodes.
type NodeListChannel struct {
	List  chan *api.NodeList
	Error chan error
}

// Returns a pair of channels to a Node list and errors that both must be read
// numReads times.
func GetNodeListChannel(client client.NodesInterface, numReads int) NodeListChannel {
	channel := NodeListChannel{
		List:  make(chan *api.NodeList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		nodes, err := client.Nodes().List(listEverything)

		for i := 0; i < numReads; i++ {
			channel.List <- nodes
			channel.Error <- err
		}
	}()

	return channel
}

// List and error channels to Nodes.
type EventListChannel struct {
	List  chan *api.EventList
	Error chan error
}

// Returns a pair of channels to an Event list and errors that both must be read
// numReads times.
func GetEventListChannel(client client.EventNamespacer, numReads int) EventListChannel {
	channel := EventListChannel{
		List:  make(chan *api.EventList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		events, err := client.Events(api.NamespaceAll).List(listEverything)

		for i := 0; i < numReads; i++ {
			channel.List <- events
			channel.Error <- err
		}
	}()

	return channel
}

// List and error channels to Nodes.
type PodListChannel struct {
	List  chan *api.PodList
	Error chan error
}

// Returns a pair of channels to a Pod list and errors that both must be read
// numReads times.
func GetPodListChannel(client client.PodsNamespacer, numReads int) PodListChannel {
	channel := PodListChannel{
		List:  make(chan *api.PodList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		pods, err := client.Pods(api.NamespaceAll).List(listEverything)

		for i := 0; i < numReads; i++ {
			channel.List <- pods
			channel.Error <- err
		}
	}()

	return channel
}

// List and error channels to Nodes.
type ReplicationControllerListChannel struct {
	List  chan *api.ReplicationControllerList
	Error chan error
}

// Returns a pair of channels to a Replication Controller list and errors that both must be read
// numReads times.
func GetReplicationControllerListChannel(client client.ReplicationControllersNamespacer,
	numReads int) ReplicationControllerListChannel {

	channel := ReplicationControllerListChannel{
		List:  make(chan *api.ReplicationControllerList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		rcs, err := client.ReplicationControllers(api.NamespaceAll).List(listEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- rcs
			channel.Error <- err
		}
	}()

	return channel
}

// List and error channels to Deployments.
type DeploymentListChannel struct {
	List  chan *extensions.DeploymentList
	Error chan error
}

// Returns a pair of channels to a Deployment list and errors that both must be read
// numReads times.
func GetDeploymentListChannel(client client.DeploymentsNamespacer, numReads int) DeploymentListChannel {
	channel := DeploymentListChannel{
		List:  make(chan *extensions.DeploymentList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		rcs, err := client.Deployments(api.NamespaceAll).List(listEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- rcs
			channel.Error <- err
		}
	}()

	return channel
}

// List and error channels to Replica Sets.
type ReplicaSetListChannel struct {
	List  chan *extensions.ReplicaSetList
	Error chan error
}

// Returns a pair of channels to a ReplicaSet list and errors that both must be read
// numReads times.
func GetReplicaSetListChannel(client client.ReplicaSetsNamespacer, numReads int) ReplicaSetListChannel {
	channel := ReplicaSetListChannel{
		List:  make(chan *extensions.ReplicaSetList, numReads),
		Error: make(chan error, numReads),
	}

	go func() {
		rcs, err := client.ReplicaSets(api.NamespaceAll).List(listEverything)
		for i := 0; i < numReads; i++ {
			channel.List <- rcs
			channel.Error <- err
		}
	}()

	return channel
}
