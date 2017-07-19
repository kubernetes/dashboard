package auth

import (
	"net/http"

	"github.com/emicklei/go-restful"
	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
)

type AuthHandler struct {
	manager authApi.AuthManager
}

func (self AuthHandler) Install(ws *restful.WebService) {
	ws.Route(
		ws.POST("/login").
			To(self.handleLogin).
			Reads(authApi.LoginSpec{}).
			Writes(authApi.LoginResponse{}))
}

func (self AuthHandler) handleLogin(request *restful.Request, response *restful.Response) {
	loginSpec := new(authApi.LoginSpec)
	if err := request.ReadEntity(loginSpec); err != nil {
		response.AddHeader("Content-Type", "text/plain")
		response.WriteErrorString(http.StatusInternalServerError, err.Error()+"\n")
		return
	}

	token, err := self.manager.Login(loginSpec)
	// TODO: check for non-critical errors
	if err != nil {
		response.AddHeader("Content-Type", "text/plain")
		response.WriteErrorString(http.StatusInternalServerError, err.Error()+"\n")
		return
	}

	response.WriteHeaderAndEntity(http.StatusOK, authApi.LoginResponse{JWTToken: token})
}

func NewAuthHandler(manager authApi.AuthManager) AuthHandler {
	return AuthHandler{manager: manager}
}
