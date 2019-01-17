package csrf

import (
	"log"

	"k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"

	"github.com/kubernetes/dashboard/src/app/backend/args"
	"github.com/kubernetes/dashboard/src/app/backend/client/api"
)

type csrfTokenManager struct {
	token  string
	client kubernetes.Interface
}

func (self *csrfTokenManager) init() {
	log.Printf("Initializing csrf token from %s secret", api.CsrfTokenSecretName)
	tokenSecret, err := self.client.CoreV1().
		Secrets(args.Holder.GetNamespace()).
		Get(api.CsrfTokenSecretName, v1.GetOptions{})

	if err != nil {
		panic(err)
	}

	token := string(tokenSecret.Data[api.CsrfTokenSecretData])
	if len(token) == 0 {
		log.Printf("Empty token. Generating and storing in a secret %s", api.CsrfTokenSecretName)
		token = api.GenerateCSRFKey()
		tokenSecret.StringData = map[string]string{api.CsrfTokenSecretData: token}
		_, err := self.client.CoreV1().Secrets(args.Holder.GetNamespace()).Update(tokenSecret)
		if err != nil {
			panic(err)
		}
	}

	self.token = token
}

func (self *csrfTokenManager) Token() string {
	return self.token
}

func NewCsrfTokenManager(client kubernetes.Interface) api.CsrfTokenManager {
	manager := &csrfTokenManager{client: client}
	manager.init()

	return manager
}
