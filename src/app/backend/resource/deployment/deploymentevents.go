package deployment

import (
	"log"

	"github.com/kubernetes/dashboard/resource/common"
	"github.com/kubernetes/dashboard/resource/event"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

func GetDeploymentEvents(client client.Interface, namespace string, deploymentName string) (*common.EventList, error) {

	log.Printf("Getting events related to %s deployment in %s namespace", deploymentName,
		namespace)

	// Get events for deployment.
	dpEvents, err := event.GetEvents(client, namespace, deploymentName)
	if err != nil {
		return nil, err
	}

	if !event.IsTypeFilled(dpEvents) {
		dpEvents = event.FillEventsType(dpEvents)
	}

	events := event.AppendEvents(dpEvents, common.EventList{
		Namespace: namespace,
		Events:    make([]common.Event, 0),
	})

	log.Printf("Found %d events related to %s deployment in %s namespace",
		len(events.Events), deploymentName, namespace)

	return &events, nil
}
