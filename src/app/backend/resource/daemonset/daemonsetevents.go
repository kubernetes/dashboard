package daemonset

import (
	"log"

	"k8s.io/kubernetes/pkg/api"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
)

// GetDeploymentEvents returns model events for a deployment with the given name in the given
// namespace
func GetDaemonSetEvents(dsEvents []api.Event, namespace string, daemonSet string) (
	*common.EventList, error) {

	log.Printf("Getting events related to %s daemon set in %s namespace", daemonSet, namespace)

	if !event.IsTypeFilled(dsEvents) {
		dsEvents = event.FillEventsType(dsEvents)
	}

	events := event.ToEventList(dsEvents, namespace)

	log.Printf("Found %d events related to %s daemon set in %s namespace",
		len(events.Events), daemonSet, namespace)

	return &events, nil
}
