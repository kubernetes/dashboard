package auth

import (
	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	"errors"
	"k8s.io/client-go/tools/clientcmd/api"
)

// TODO: Dev only property. Should be retrieved from a secret
const tokenSigningKey = ""
// For testing only
const JWTToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJzdGF0ZWZ1bHNldC1jb250cm9sbGVyLXRva2VuLTZxa2N6Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6InN0YXRlZnVsc2V0LWNvbnRyb2xsZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiI2ODQ3NmE2Ny0zNTZhLTExZTctODJmNC05MDFiMGU1MzI1MTYiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06c3RhdGVmdWxzZXQtY29udHJvbGxlciJ9.K6d49gokYlhnN69kpM-1dJ9sUFhIXSQdUX3OjldVJiwJyNttI9gvi5tivP_p_ONrMvE6UvP4Gun73yRO22AotADPbI7_X4K6Yw0uLyUlvC-qDTyk6kHjifCm68GI7XqgGwjx63FImS4kOWVSIdrY92se2F5-ftEuqNLdw22Bv5xBoR1WbhqV3gDMjp5Bh2dzpDKaAQnlM_LBTbvzWoUnZNtnP5A36IH3emuvXziu53iy4qqIZhqhgtTBzknJEoUu8x4qeTEUvIyU22qk6TtB6W-zO1EWtTCeKWM47Q-Kw2Q4XeqfU0FsgaoKe7r-MqJ4yg1_-myv9h2T7LiX3PLICg"

// authManager implements AuthManager interface
type authManager struct {}

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

	token, err := self.TokenManager.Generate(authInfo)
	return JWTToken, nil
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
	return &authManager{}
}
