package api

import "k8s.io/client-go/tools/clientcmd/api"

type AuthManager interface {
	Login(*LoginSpec) (string, error)
	DecryptToken(string) (*api.AuthInfo, error)
}

type TokenManager interface {
	Generate(api.AuthInfo) (string, error)
	Decrypt(string) (*api.AuthInfo, error)
}

type Authenticator interface {
	GetAuthInfo() (api.AuthInfo, error)
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