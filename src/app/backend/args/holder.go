package args

import (
	"net"

	"github.com/kubernetes/dashboard/src/app/backend/cert/api"
)

var ArgHolder = &argHolder{}

type argHolder struct {
	insecurePort            int
	port                    int
	tokenTTL                int
	metricClientCheckPeriod int

	insecureBindAddress net.IP
	bindAddress         net.IP

	defaultCertDir       string
	certFile             string
	keyFile              string
	apiServerHost        string
	heapsterHost         string
	kubeConfigFile       string
	systemBanner         string
	systemBannerSeverity string

	authenticationMode []string

	autoGenerateCertificates bool
	enableInsecureLogin      bool
	enableSettingsAuthorizer bool
}

func (self *argHolder) GetInsecurePort() int {
	return self.insecurePort
}

func (self *argHolder) GetPort() int {
	return self.port
}

func (self *argHolder) GetTokenTTL() int {
	return self.tokenTTL
}

func (self *argHolder) GetMetricClientCheckPeriod() int {
	return self.metricClientCheckPeriod
}

func (self *argHolder) GetInsecureBindAddress() net.IP {
	return self.insecureBindAddress
}

func (self *argHolder) GetBindAddress() net.IP {
	return self.bindAddress
}

func (self *argHolder) GetDefaultCertDir() string {
	return self.defaultCertDir
}

func (self *argHolder) GetCertFile() string {
	if len(self.certFile) == 0 && self.autoGenerateCertificates {
		return api.DashboardCertName
	}

	return self.certFile
}

func (self *argHolder) GetKeyFile() string {
	if len(self.keyFile) == 0 && self.autoGenerateCertificates {
		return api.DashboardKeyName
	}

	return self.keyFile
}

func (self *argHolder) GetApiServerHost() string {
	return self.apiServerHost
}

func (self *argHolder) GetHeapsterHost() string {
	return self.heapsterHost
}

func (self *argHolder) GetKubeConfigFile() string {
	return self.kubeConfigFile
}

func (self *argHolder) GetSystemBanner() string {
	return self.systemBanner
}

func (self *argHolder) GetSystemBannerSeverity() string {
	return self.systemBannerSeverity
}

func (self *argHolder) GetAuthenticationMode() []string {
	return self.authenticationMode
}

func (self *argHolder) GetAutoGenerateCertificates() bool {
	return self.autoGenerateCertificates
}

func (self *argHolder) GetEnableInsecureLogin() bool {
	return self.enableInsecureLogin
}

func (self *argHolder) GetEnableSettingsAuthorizer() bool {
	return self.enableSettingsAuthorizer
}
