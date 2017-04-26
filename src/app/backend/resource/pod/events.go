package pod

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	client "k8s.io/client-go/kubernetes"
)

// GetEventsForPod gets events that are associated with this pod.
func GetEventsForPod(client client.Interface, dsQuery *dataselect.DataSelectQuery, namespace,
	podName string) (*common.EventList, error) {

	// Get events for pod.
	rsEvents, err := event.GetEvents(client, namespace, podName)
	if err != nil {
		return nil, err
	}

	// Get events for pods in job.
	podEvents, err := event.GetPodEvents(client, namespace, podName)
	if err != nil {
		return nil, err
	}

	apiEvents := append(rsEvents, podEvents...)
	if !event.IsTypeFilled(apiEvents) {
		apiEvents = event.FillEventsType(apiEvents)
	}

	events := event.CreateEventList(apiEvents, dsQuery)

	log.Printf("Found %d events related to %s pod in %s namespace", len(events.Events), podName,
		namespace)

	return &events, nil
}
