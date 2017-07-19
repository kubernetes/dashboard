package auth

import (
	"errors"
	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	"github.com/kubernetes/dashboard/src/app/backend/auth/jwt"
	"k8s.io/client-go/tools/clientcmd/api"
)

// authManager implements AuthManager interface
type authManager struct {
	tokenManager authApi.TokenManager
}

func (self authManager) Login(spec *authApi.LoginSpec) (string, error) {
	authenticator, err := self.getAuthenticator(spec)
	if err != nil {
		return "", err
	}

	authInfo, err := authenticator.GetAuthInfo()
	if err != nil {
		return "", err
	}

	if err := self.healthCheck(authInfo); err != nil {
		return "", err
	}

	token, err := self.tokenManager.Generate(authInfo)
	if err != nil {
		return "", err
	}

	return token, nil
}

func (self authManager) DecryptToken(token string) (*api.AuthInfo, error) {
	return self.tokenManager.Decrypt(token)
}

func (self authManager) getAuthenticator(spec *authApi.LoginSpec) (authApi.Authenticator, error) {
	if len(spec.Username) > 0 && len(spec.Password) > 0 {
		return NewBasicAuthenticator(spec), nil
	}

	return nil, errors.New("Not enough data to create authenticator.")
}

func (self authManager) healthCheck(authInfo api.AuthInfo) error {
	return nil
}

func NewAuthManager() authApi.AuthManager {
	return &authManager{tokenManager: jwt.NewJWTTokenManager()}
}
