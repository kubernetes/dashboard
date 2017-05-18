package integration

import (
	"github.com/emicklei/go-restful"
	"github.com/kubernetes/dashboard/src/app/backend/integration/metric/heapster"
)

type IntegrationHandler struct {
	heapsterHandler heapster.HeapsterHandler
}

func (handler IntegrationHandler) Install(ws *restful.WebService) {
	handler.heapsterHandler.Install(ws)
}

func NewIntegrationsHandler(client IntegrationClient) IntegrationHandler {
	return IntegrationHandler{
		heapsterHandler: heapster.NewHeapsterHandler(client.GetMetricClient()),
	}
}