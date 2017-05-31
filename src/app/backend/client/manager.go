package client

import (
	"crypto/rand"
	"errors"
	"log"
	"strings"

	"github.com/emicklei/go-restful"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/tools/clientcmd/api"
)

// Dashboard UI default values for client configs.
const (
	// High enough QPS to fit all expected use cases. QPS=0 is not set here, because
	// client code is overriding it.
	DefaultQPS = 1e6
	// High enough Burst to fit all expected use cases. Burst=0 is not set here, because
	// client code is overriding it.
	DefaultBurst = 1e6
	// Use kubernetes protobuf as content type by default
	DefaultContentType = "application/vnd.kubernetes.protobuf"
)

type CsrfToken struct {
	Token string `json:"token"`
}

type ClientManager interface {
	Client(req *restful.Request) (*kubernetes.Clientset, error)
	Config(req *restful.Request) (*rest.Config, error)
	CSRFKey() string
	RawClient() (*kubernetes.Clientset, error)
	VerberClient(req *restful.Request) (ResourceVerber, error)
}

type clientManager struct {
	csrfKey         string
	kubeConfigPath  string
	apiserverHost   string
	inClusterConfig *rest.Config
}

func (self *clientManager) Client(req *restful.Request) (*kubernetes.Clientset, error) {
	cfg, err := self.Config(req)
	if err != nil {
		return nil, err
	}

	client, err := kubernetes.NewForConfig(cfg)
	if err != nil {
		return nil, err
	}

	return client, nil
}

func (self *clientManager) Config(req *restful.Request) (*rest.Config, error) {
	authInfo := self.extractAuthInfo(req)

	cfg, err := self.buildConfigFromFlags(self.apiserverHost, self.kubeConfigPath)
	if err != nil {
		return nil, err
	}

	// Override auth header token. For now only bearer token is supported
	if len(authInfo.Token) > 0 {
		cfg.BearerToken = authInfo.Token
	}

	self.initConfig(cfg)
	return cfg, nil
}

func (self *clientManager) CSRFKey() string {
	return self.csrfKey
}

func (self *clientManager) RawClient() (*kubernetes.Clientset, error) {
	cfg, err := self.buildConfigFromFlags(self.apiserverHost, self.kubeConfigPath)
	if err != nil {
		return nil, err
	}

	self.initConfig(cfg)

	log.Printf("Creating API server client for %s", cfg.Host)
	return kubernetes.NewForConfig(cfg)
}

func (self *clientManager) VerberClient(req *restful.Request) (ResourceVerber, error) {
	client, err := self.Client(req)
	if err != nil {
		return ResourceVerber{}, err
	}

	return NewResourceVerber(client.CoreV1().RESTClient(),
		client.ExtensionsV1beta1().RESTClient(), client.AppsV1beta1().RESTClient(),
		client.BatchV1().RESTClient(), client.AutoscalingV1().RESTClient(),
		client.StorageV1beta1().RESTClient()), nil
}

func (self *clientManager) initConfig(cfg *rest.Config) {
	cfg.QPS = DefaultQPS
	cfg.Burst = DefaultBurst
	cfg.ContentType = DefaultContentType
}

func (self *clientManager) buildConfigFromFlags(apiserverHost, kubeConfigPath string) (
	*rest.Config, error) {
	if len(kubeConfigPath) > 0 || len(apiserverHost) > 0 {
		return clientcmd.NewNonInteractiveDeferredLoadingClientConfig(
			&clientcmd.ClientConfigLoadingRules{ExplicitPath: kubeConfigPath},
			&clientcmd.ConfigOverrides{ClusterInfo: api.Cluster{Server: apiserverHost}}).ClientConfig()
	}

	if self.isRunningInCluster() {
		return self.inClusterConfig, nil
	}

	return nil, errors.New("Could not create client config. Check logs for more information.")
}

func (self *clientManager) extractAuthInfo(req *restful.Request) api.AuthInfo {
	authHeader := req.HeaderParameter("Authorization")
	token := ""
	if strings.HasPrefix(authHeader, "Bearer ") {
		token = strings.TrimPrefix(authHeader, "Bearer ")
	}

	return api.AuthInfo{Token: token}
}

func (self *clientManager) init() {
	self.initInClusterConfig()
	self.initCSRFKey()
}

func (self clientManager) initCSRFKey() {
	if self.inClusterConfig == nil {
		// Most likely running for a dev, so no replica issues, just generate a random key
		log.Println("Using random key for csrf signing")
		self.generateCSRFKey()
		return
	}

	// We run in a cluster, so we should use a signing key that is the same for potential replications
	log.Println("Using service account token for csrf signing")
	self.csrfKey = self.inClusterConfig.BearerToken
}

func (self *clientManager) initInClusterConfig() {
	cfg, err := rest.InClusterConfig()
	if err != nil {
		log.Printf("Could not init in cluster config: %s", err.Error())
		return
	}

	self.inClusterConfig = cfg
}

func (self *clientManager) generateCSRFKey() {
	bytes := make([]byte, 256)
	_, err := rand.Read(bytes)
	if err != nil {
		panic("Fatal error. Could not generate csrf key.")
	}

	self.csrfKey = string(bytes)
}

func (self *clientManager) isRunningInCluster() bool {
	return self.inClusterConfig != nil
}

func NewClientManager(kubeConfigPath, apiserverHost string) ClientManager {
	result := &clientManager{
		kubeConfigPath: kubeConfigPath,
		apiserverHost:  apiserverHost,
	}

	result.init()

	return result
}
