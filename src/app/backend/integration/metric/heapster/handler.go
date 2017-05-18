package heapster

import (
	"github.com/emicklei/go-restful"
	"github.com/kubernetes/dashboard/src/app/backend/integration/metric"
)

type HeapsterHandler struct {
	client metric.MetricClient
}

func NewHeapsterHandler(client metric.MetricClient) HeapsterHandler {
	return HeapsterHandler{client: client}
}

type Status string

func (handler HeapsterHandler) Install(ws *restful.WebService) {
	ws.Route(
		ws.GET("/heapster/status").
			To(handler.HandleGetStatus).
			Writes(Status("")))
}

func (self HeapsterHandler) HandleGetStatus(request *restful.Request, response *restful.Response) {
	response.WriteEntity(self.client.HealthCheck())
}
