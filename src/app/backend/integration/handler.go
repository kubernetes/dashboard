package integration

import (
	"log"
	"net/http"

	"github.com/emicklei/go-restful"
	"github.com/kubernetes/dashboard/src/app/backend/integration/api"
	errorsK8s "k8s.io/apimachinery/pkg/api/errors"
)

type IntegrationHandler struct {
	manager IntegrationManager
}

func (self IntegrationHandler) Install(ws *restful.WebService) {
	self.installStateHandler(ws)
}

func (self IntegrationHandler) installStateHandler(ws *restful.WebService) {
	ws.Route(
		ws.GET("/integration/{name}/state").
			To(self.handleGetState).
			Writes(api.IntegrationState{}))
}

func (self IntegrationHandler) handleGetState(request *restful.Request, response *restful.Response) {
	integrationName := request.PathParameter("name")
	state, err := self.manager.GetState(api.IntegrationID(integrationName))
	if err != nil {
		handleInternalError(response, err)
		return
	}
	response.WriteHeaderAndEntity(http.StatusOK, state)
}

func NewIntegrationHandler(manager IntegrationManager) IntegrationHandler {
	return IntegrationHandler{manager: manager}
}

// Handler that writes the given error to the response and sets appropriate HTTP status headers.
func handleInternalError(response *restful.Response, err error) {
	log.Print(err)
	statusCode := http.StatusInternalServerError
	statusError, ok := err.(*errorsK8s.StatusError)
	if ok && statusError.Status().Code > 0 {
		statusCode = int(statusError.Status().Code)
	}
	response.AddHeader("Content-Type", "text/plain")
	response.WriteErrorString(statusCode, err.Error()+"\n")
}
