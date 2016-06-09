package deployment

import (
	"log"

	"k8s.io/kubernetes/pkg/api"

	"github.com/kubernetes/dashboard/resource/common"
	"github.com/kubernetes/dashboard/resource/event"
)

func GetDeploymentEvents(dpEvents []api.Event, namespace string, deploymentName string) (*common.EventList, error) {

	log.Printf("Getting events related to %s deployment in %s namespace", deploymentName,
		namespace)

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
