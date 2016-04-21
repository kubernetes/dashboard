package main

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
func getServiceListChannel(client *client.Client, numReads int) ServiceListChannel {
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
func getNodeListChannel(client *client.Client, numReads int) NodeListChannel {
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
func getEventListChannel(client *client.Client, numReads int) EventListChannel {
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
func getPodListChannel(client *client.Client, numReads int) PodListChannel {
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
func getReplicationControllerListChannel(client *client.Client, numReads int) ReplicationControllerListChannel {
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

// List and error channels to Nodes.
type ReplicaSetListChannel struct {
	List  chan *extensions.ReplicaSetList
	Error chan error
}

// Returns a pair of channels to a ReplicaSet list and errors that both must be read
// numReads times.
func getReplicaSetListChannel(client *client.Client, numReads int) ReplicaSetListChannel {
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
