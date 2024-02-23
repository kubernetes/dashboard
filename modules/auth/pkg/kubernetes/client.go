package kubernetes

import (
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	client "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/tools/clientcmd/api"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/auth/pkg/args"
	"k8s.io/dashboard/auth/pkg/environment"
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
	// AuthorizationHeader is the default authorization header name.
	AuthorizationHeader = "Authorization"
	// AuthorizationTokenPrefix is the default bearer token prefix.
	AuthorizationTokenPrefix = "Bearer "
)

var (
	builder *clientBuilder
)

func init() {
	config, err := buildConfigFromFlags()
	if err != nil {
		klog.ErrorS(err, "Could not init kubernetes globalClient config")
		os.Exit(1)
	}

	config.QPS = DefaultQPS
	config.Burst = DefaultBurst
	config.ContentType = DefaultContentType
	config.UserAgent = DefaultUserAgent + "/" + environment.Version

	builder = &clientBuilder{
		config: config,
	}
}

func buildConfigFromFlags() (*rest.Config, error) {
	if len(args.KubeconfigPath()) == 0 {
		klog.Info("Using in-cluster config")
		return rest.InClusterConfig()
	}

	klog.InfoS("Using kubeconfig", "kubeconfig", args.KubeconfigPath())
	return clientcmd.BuildConfigFromFlags("", args.KubeconfigPath())
}

type clientBuilder struct {
	config *rest.Config
}

func (in *clientBuilder) clientFromContext(c *gin.Context) (client.Interface, error) {
	authInfo, err := in.buildAuthInfo(c)
	if err != nil {
		return nil, err
	}

	config, err := in.buildConfigFromAuthInfo(authInfo)
	if err != nil {
		return nil, err
	}

	return client.NewForConfig(config)
}

func (in *clientBuilder) buildConfigFromAuthInfo(authInfo *api.AuthInfo) (*rest.Config, error) {
	cmdCfg := api.NewConfig()

	cmdCfg.Clusters[DefaultCmdConfigName] = &api.Cluster{
		Server:                   in.config.Host,
		CertificateAuthority:     in.config.TLSClientConfig.CAFile,
		CertificateAuthorityData: in.config.TLSClientConfig.CAData,
		InsecureSkipTLSVerify:    in.config.TLSClientConfig.Insecure,
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

func (in *clientBuilder) buildAuthInfo(c *gin.Context) (*api.AuthInfo, error) {
	if !in.hasAuthorizationHeader(c) {
		return nil, errors.NewUnauthorized(errors.MsgLoginUnauthorizedError)
	}

	token := in.extractAuthorizationToken(c)
	authInfo := &api.AuthInfo{
		Token:                token,
		ImpersonateUserExtra: make(map[string][]string),
	}

	in.handleImpersonation(authInfo, c)
	return authInfo, nil
}

func (in *clientBuilder) extractAuthorizationToken(c *gin.Context) string {
	header := c.GetHeader(AuthorizationHeader)
	return strings.TrimPrefix(header, AuthorizationTokenPrefix)
}

func (in *clientBuilder) hasAuthorizationHeader(c *gin.Context) bool {
	header := c.GetHeader(AuthorizationHeader)
	return len(header) > 0 && strings.HasPrefix(header, AuthorizationTokenPrefix)
}

func (in *clientBuilder) handleImpersonation(authInfo *api.AuthInfo, c *gin.Context) {
	user := c.GetHeader(ImpersonateUserHeader)
	groups := c.Request.Header[ImpersonateGroupHeader]

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
	for name, values := range c.Request.Header {
		if strings.HasPrefix(name, ImpersonateUserExtraHeader) {
			extraName := strings.TrimPrefix(name, ImpersonateUserExtraHeader)
			authInfo.ImpersonateUserExtra[extraName] = values
		}
	}
}

func Client(c *gin.Context) (client.Interface, error) {
	return builder.clientFromContext(c)
}
