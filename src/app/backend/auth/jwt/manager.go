package jwt

import (
	"crypto/rand"
	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	"gopkg.in/square/go-jose.v2"
	"k8s.io/apimachinery/pkg/util/json"
	"k8s.io/client-go/tools/clientcmd/api"
	"crypto/rsa"
	"fmt"
)

// For testing only
const JWTToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJzdGF0ZWZ1bHNldC1jb250cm9sbGVyLXRva2VuLTZxa2N6Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6InN0YXRlZnVsc2V0LWNvbnRyb2xsZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiI2ODQ3NmE2Ny0zNTZhLTExZTctODJmNC05MDFiMGU1MzI1MTYiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06c3RhdGVmdWxzZXQtY29udHJvbGxlciJ9.K6d49gokYlhnN69kpM-1dJ9sUFhIXSQdUX3OjldVJiwJyNttI9gvi5tivP_p_ONrMvE6UvP4Gun73yRO22AotADPbI7_X4K6Yw0uLyUlvC-qDTyk6kHjifCm68GI7XqgGwjx63FImS4kOWVSIdrY92se2F5-ftEuqNLdw22Bv5xBoR1WbhqV3gDMjp5Bh2dzpDKaAQnlM_LBTbvzWoUnZNtnP5A36IH3emuvXziu53iy4qqIZhqhgtTBzknJEoUu8x4qeTEUvIyU22qk6TtB6W-zO1EWtTCeKWM47Q-Kw2Q4XeqfU0FsgaoKe7r-MqJ4yg1_-myv9h2T7LiX3PLICg"

// TODO: Dev only property. Should be retrieved from a secret
var tokenSigningKey *rsa.PrivateKey

func init() {
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		panic(err)
	}

	tokenSigningKey = privateKey
}

// Implements TokenManager interface
type jwtTokenManager struct{}

func (self jwtTokenManager) Generate(authInfo api.AuthInfo) (token string, err error) {
	publicKey := &tokenSigningKey.PublicKey
	encrypter, err := jose.NewEncrypter(jose.A256GCM, jose.Recipient{Algorithm: jose.RSA_OAEP_256, Key: publicKey}, nil)
	if err != nil {
		return "", err
	}

	marshalledAuthInfo, err := json.Marshal(authInfo)
	if err != nil {
		return "", err
	}

	aad := []byte("test")
	jwtObject, err := encrypter.EncryptWithAuthData(marshalledAuthInfo, aad)
	if err != nil {
		return "", err
	}

	fmt.Println(jwtObject.GetAuthData())
	return jwtObject.FullSerialize(), nil
}

func (self jwtTokenManager) validate(token string) (err error) {
	jweToken, err := jose.ParseEncrypted(token)

	fmt.Println(jweToken.Header)
	fmt.Println(string(jweToken.GetAuthData()))

	return
}

func (self jwtTokenManager) Decrypt(token string) (*api.AuthInfo, error) {
	if err := self.validate(token); err != nil {
		return nil, err
	}

	jweToken, _ := jose.ParseEncrypted(token)
	decrypted, err := jweToken.Decrypt(tokenSigningKey)
	if err != nil {
		return nil, err
	}

	authInfo := new(api.AuthInfo)
	err = json.Unmarshal(decrypted, authInfo)
	return authInfo, err
}

func NewJWTTokenManager() authApi.TokenManager {
	return &jwtTokenManager{}
}
