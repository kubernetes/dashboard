package auth

import (
	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	"k8s.io/client-go/tools/clientcmd/api"
)

// x509Authenticator implements Authenticator interface
type x509Authenticator struct{}

func (x509Authenticator) GetAuthInfo() (api.AuthInfo, error) {
	// TODO: implement that
	return api.AuthInfo{}, nil
}

func NewX509Authenticator() authApi.Authenticator {
	return &x509Authenticator{}
}
