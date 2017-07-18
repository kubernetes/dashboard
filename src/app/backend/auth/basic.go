package auth


import (
	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	"k8s.io/client-go/tools/clientcmd/api"
)

// x509Authenticator implements Authenticator interface
type BasicAuthenticator struct{
	username string
	password string
}

func (BasicAuthenticator) GetAuthInfo() (api.AuthInfo, error) {
	// TODO: implement that
	return api.AuthInfo{}, nil
}

func NewBasicAuthenticator(spec *authApi.LoginSpec) authApi.Authenticator {
	return &BasicAuthenticator{
		username: spec.Username,
		password: spec.Password,
	}
}