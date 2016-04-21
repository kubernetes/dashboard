package main

import (
	"k8s.io/kubernetes/pkg/api"
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

// Returns a pair of channelto a Service list and errors that must be read
func getServiceListChannel(client *client.Client, numClients int) ServiceListChannel {
	listEverything := api.ListOptions{
		LabelSelector: labels.Everything(),
		FieldSelector: fields.Everything(),
	}
	channel := ServiceListChannel{
		List:  make(chan *api.ServiceList, numClients),
		Error: make(chan error, numClients),
	}
	go func() {
		services, err := client.Services(api.NamespaceAll).List(listEverything)

		for i := 0; i < numClients; i++ {
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

func getNodeListChannel(client *client.Client, numClients int) NodeListChannel {
	listEverything := api.ListOptions{
		LabelSelector: labels.Everything(),
		FieldSelector: fields.Everything(),
	}

	channel := NodeListChannel{
		List:  make(chan *api.NodeList, numClients),
		Error: make(chan error, numClients),
	}

	go func() {
		nodes, err := client.Nodes().List(listEverything)

		for i := 0; i < numClients; i++ {
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

func getEventListChannel(client *client.Client, numClients int) EventListChannel {
	listEverything := api.ListOptions{
		LabelSelector: labels.Everything(),
		FieldSelector: fields.Everything(),
	}

	channel := EventListChannel{
		List:  make(chan *api.EventList, numClients),
		Error: make(chan error, numClients),
	}

	go func() {
		events, err := client.Events(api.NamespaceAll).List(listEverything)

		for i := 0; i < numClients; i++ {
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

func getPodListChannel(client *client.Client, numClients int) PodListChannel {
	listEverything := api.ListOptions{
		LabelSelector: labels.Everything(),
		FieldSelector: fields.Everything(),
	}

	channel := PodListChannel{
		List:  make(chan *api.PodList, numClients),
		Error: make(chan error, numClients),
	}

	go func() {
		pods, err := client.Pods(api.NamespaceAll).List(listEverything)

		for i := 0; i < numClients; i++ {
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

func getReplicaionControllerListChannel(client *client.Client, numClients int) ReplicationControllerListChannel {
	listEverything := api.ListOptions{
		LabelSelector: labels.Everything(),
		FieldSelector: fields.Everything(),
	}

	channel := ReplicationControllerListChannel{
		List:  make(chan *api.ReplicationControllerList, numClients),
		Error: make(chan error, numClients),
	}

	go func() {
		rcs, err := client.ReplicationControllers(api.NamespaceAll).List(listEverything)
		for i := 0; i < numClients; i++ {
			channel.List <- rcs
			channel.Error <- err
		}
	}()

	return channel
}
