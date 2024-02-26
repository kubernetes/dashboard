package client

import (
	"net/http"
	"os"
	"strings"

	client "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/tools/clientcmd/api"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/errors"
)

const (
	// DefaultQPS is the default globalClient QPS configuration. High enough QPS to fit all expected use cases.
	// QPS=0 is not set here, because globalClient code is overriding it.
	DefaultQPS = 1e6
	// DefaultBurst is the default globalClient burst configuration. High enough Burst to fit all expected use cases.
	// Burst=0 is not set here, because globalClient code is overriding it.
	DefaultBurst = 1e6
	// DefaultContentType is the default kubernetes protobuf content type
	DefaultContentType = "application/vnd.kubernetes.protobuf"
	// DefaultCmdConfigName is the default cluster/context/auth name to be set in clientcmd config
	DefaultCmdConfigName = "kubernetes"
	// DefaultUserAgent is the default http header for user-agent
	DefaultUserAgent = "dashboard"
	// ImpersonateUserHeader is the header name to identify username to act as.
	ImpersonateUserHeader = "Impersonate-User"
	// ImpersonateGroupHeader is the header name to identify group name to act as.
	// Can be provided multiple times to set multiple groups.
	ImpersonateGroupHeader = "Impersonate-Group"
	// ImpersonateUserExtraHeader is the header name used to associate extra fields with the user.
	// It is optional, and it requires ImpersonateUserHeader to be set.
	ImpersonateUserExtraHeader = "Impersonate-Extra-"
)

var (
	inClusterClient client.Interface
	baseConfig      *rest.Config
)

type Option func(*configBuilder)

type configBuilder struct {
	userAgent      string
	kubeconfigPath string
	masterUrl      string
}

func (in *configBuilder) buildBaseConfig() (*rest.Config, error) {
	if len(in.kubeconfigPath) == 0 && len(in.masterUrl) == 0 {
		klog.Info("Using in-cluster config")
		return rest.InClusterConfig()
	}

	klog.InfoS("Using kubeconfig", "kubeconfig", in.kubeconfigPath)
	config, err := clientcmd.BuildConfigFromFlags(in.masterUrl, in.kubeconfigPath)
	if err != nil {
		return nil, err
	}

	config.QPS = DefaultQPS
	config.Burst = DefaultBurst
	config.ContentType = DefaultContentType
	config.UserAgent = DefaultUserAgent + "/" + in.userAgent

	return config, nil
}

func newConfigBuilder(options ...Option) *configBuilder {
	builder := &configBuilder{}

	for _, opt := range options {
		opt(builder)
	}

	return builder
}

func WithUserAgent(agent string) Option {
	return func(c *configBuilder) {
		c.userAgent = agent
	}
}

func WithKubeconfig(path string) Option {
	return func(c *configBuilder) {
		c.kubeconfigPath = path
	}
}

func WithMasterUrl(url string) Option {
	return func(c *configBuilder) {
		c.masterUrl = url
	}
}

func clientFromRequest(request *http.Request) (client.Interface, error) {
	authInfo, err := buildAuthInfo(request)
	if err != nil {
		return nil, err
	}

	config, err := buildConfigFromAuthInfo(authInfo)
	if err != nil {
		return nil, err
	}

	return client.NewForConfig(config)
}

func buildConfigFromAuthInfo(authInfo *api.AuthInfo) (*rest.Config, error) {
	cmdCfg := api.NewConfig()

	cmdCfg.Clusters[DefaultCmdConfigName] = &api.Cluster{
		Server:                   baseConfig.Host,
		CertificateAuthority:     baseConfig.TLSClientConfig.CAFile,
		CertificateAuthorityData: baseConfig.TLSClientConfig.CAData,
		InsecureSkipTLSVerify:    baseConfig.TLSClientConfig.Insecure,
	}

	cmdCfg.AuthInfos[DefaultCmdConfigName] = authInfo

	cmdCfg.Contexts[DefaultCmdConfigName] = &api.Context{
		Cluster:  DefaultCmdConfigName,
		AuthInfo: DefaultCmdConfigName,
	}

	cmdCfg.CurrentContext = DefaultCmdConfigName

	return clientcmd.NewDefaultClientConfig(
		*cmdCfg,
		&clientcmd.ConfigOverrides{},
	).ClientConfig()
}

func buildAuthInfo(request *http.Request) (*api.AuthInfo, error) {
	if !HasAuthorizationHeader(request) {
		return nil, errors.NewUnauthorized(errors.MsgLoginUnauthorizedError)
	}

	token := GetBearerToken(request)
	authInfo := &api.AuthInfo{
		Token:                token,
		ImpersonateUserExtra: make(map[string][]string),
	}

	handleImpersonation(authInfo, request)
	return authInfo, nil
}

func handleImpersonation(authInfo *api.AuthInfo, request *http.Request) {
	user := request.Header.Get(ImpersonateUserHeader)
	groups := request.Header[ImpersonateGroupHeader]

	if len(user) == 0 {
		return
	}

	// Impersonate user
	authInfo.Impersonate = user

	// Impersonate groups if available
	if len(groups) > 0 {
		authInfo.ImpersonateGroups = groups
	}

	// Add extra impersonation fields if available
	for name, values := range request.Header {
		if strings.HasPrefix(name, ImpersonateUserExtraHeader) {
			extraName := strings.TrimPrefix(name, ImpersonateUserExtraHeader)
			authInfo.ImpersonateUserExtra[extraName] = values
		}
	}
}

func Init(options ...Option) {
	builder := newConfigBuilder(options...)

	config, err := builder.buildBaseConfig()
	if err != nil {
		klog.ErrorS(err, "Could not init kubernetes client config")
		os.Exit(1)
	}

	baseConfig = config
}

func InClusterClient() (client.Interface, error) {
	if inClusterClient != nil {
		return inClusterClient, nil
	}

	// init on-demand only
	c, err := client.NewForConfig(baseConfig)
	if err != nil {
		klog.ErrorS(err, "Could not init kubernetes in-cluster client")
		os.Exit(1)
	}

	// initialize in-memory client
	inClusterClient = c
	return inClusterClient, nil
}

func Client(request *http.Request) (client.Interface, error) {
	return clientFromRequest(request)
}
