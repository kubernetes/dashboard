package auth

import (
	"net/http"

	"github.com/emicklei/go-restful"
)

type AuthHandler struct {
	manager AuthManager
}

type LoginSpec struct {
	// Username is the username for basic authentication to the kubernetes cluster.
	Username string `json:"username"`
	// Password is the password for basic authentication to the kubernetes cluster.
	Password string `json:"password"`

	// ClientCert contains PEM-encoded data from a client cert file for TLS. Overrides ClientCertificate
	ClientCert []byte `json:"clientCert"`
	// ClientKey contains PEM-encoded data from a client key file for TLS. Overrides ClientKey
	ClientKey []byte `json:"clientKey"`

	// Token is the bearer token for authentication to the kubernetes cluster.
	Token string `json:"jwtToken"`

	// KubeConfig is the content of users' kubeconfig file. It will be parsed and auth data will be extracted.
	// Kubeconfig can not contain any paths. All data has to be provided within the file.
	KubeConfig string `json:"kubeConfig"`
}

type LoginResponse struct {
	JWTToken string `json:"jwtToken"`
}

func (self AuthHandler) Install(ws *restful.WebService) {
	ws.Route(
		ws.POST("/login").
			To(self.handleLogin).
			Reads(LoginSpec{}).
			Writes(LoginResponse{}))
}

func (self AuthHandler) handleLogin(request *restful.Request, response *restful.Response) {
	loginSpec := new(LoginSpec)
	if err := request.ReadEntity(loginSpec); err != nil {
		response.AddHeader("Content-Type", "text/plain")
		response.WriteErrorString(http.StatusInternalServerError, err.Error()+"\n")
		return
	}

	token, err := self.manager.Login(loginSpec)
	if err != nil {
		response.AddHeader("Content-Type", "text/plain")
		response.WriteErrorString(http.StatusInternalServerError, err.Error()+"\n")
		return
	}

	response.WriteHeaderAndEntity(http.StatusOK, LoginResponse{JWTToken: token})
}

func NewAuthHandler(manager AuthManager) AuthHandler {
	return AuthHandler{manager: manager}
}
