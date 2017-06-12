package integration

import (
	"net/http"

	"github.com/emicklei/go-restful"
	"github.com/kubernetes/dashboard/src/app/backend/integration/api"
)

// IntegrationHandler manages all endpoints related to integrated applications, such as state.
type IntegrationHandler struct {
	manager IntegrationManager
}

// Install creates new endpoints for integrations.
func (self IntegrationHandler) Install(ws *restful.WebService) {
	ws.Route(
		ws.GET("/integration/{name}/state").
			To(self.handleGetState).
			Writes(api.IntegrationState{}))
}

func (self IntegrationHandler) handleGetState(request *restful.Request, response *restful.Response) {
	integrationName := request.PathParameter("name")
	state, err := self.manager.GetState(api.IntegrationID(integrationName))
	if err != nil {
		response.AddHeader("Content-Type", "text/plain")
		response.WriteErrorString(http.StatusInternalServerError, err.Error()+"\n")
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, state)
}

// NewIntegrationHandler creates IntegrationHandler.
func NewIntegrationHandler(manager IntegrationManager) IntegrationHandler {
	return IntegrationHandler{manager: manager}
}
