package args

import "net"

var builder = &argHolderBuilder{holder: ArgHolder}

type argHolderBuilder struct {
	holder *argHolder
}

func (self *argHolderBuilder) SetInsecurePort(port int) *argHolderBuilder {
	self.holder.insecurePort = port
	return self
}

func (self *argHolderBuilder) SetPort(port int) *argHolderBuilder {
	self.holder.port = port
	return self
}

func (self *argHolderBuilder) SetTokenTTL(ttl int) *argHolderBuilder {
	self.holder.tokenTTL = ttl
	return self
}

func (self *argHolderBuilder) SetMetricClientCheckPeriod(period int) *argHolderBuilder {
	self.holder.metricClientCheckPeriod = period
	return self
}

func (self *argHolderBuilder) SetInsecureBindAddress(ip net.IP) *argHolderBuilder {
	self.holder.insecureBindAddress = ip
	return self
}

func (self *argHolderBuilder) SetBindAddress(ip net.IP) *argHolderBuilder {
	self.holder.bindAddress = ip
	return self
}

func (self *argHolderBuilder) SetDefaultCertDir(certDir string) *argHolderBuilder {
	self.holder.defaultCertDir = certDir
	return self
}

func (self *argHolderBuilder) SetCertFile(certFile string) *argHolderBuilder {
	self.holder.certFile = certFile
	return self
}

func (self *argHolderBuilder) SetKeyFile(keyFile string) *argHolderBuilder {
	self.holder.keyFile = keyFile
	return self
}

func (self *argHolderBuilder) SetApiServerHost(apiServerHost string) *argHolderBuilder {
	self.holder.apiServerHost = apiServerHost
	return self
}

func (self *argHolderBuilder) SetHeapsterHost(heapsterHost string) *argHolderBuilder {
	self.holder.heapsterHost = heapsterHost
	return self
}

func (self *argHolderBuilder) SetKubeConfigFile(kubeConfigFile string) *argHolderBuilder {
	self.holder.kubeConfigFile = kubeConfigFile
	return self
}

func (self *argHolderBuilder) SetSystemBanner(systemBanner string) *argHolderBuilder {
	self.holder.systemBanner = systemBanner
	return self
}

func (self *argHolderBuilder) SetSystemBannerSeverity(systemBannerSeverity string) *argHolderBuilder {
	self.holder.systemBannerSeverity = systemBannerSeverity
	return self
}

func (self *argHolderBuilder) SetAuthenticationMode(authMode []string) *argHolderBuilder {
	self.holder.authenticationMode = authMode
	return self
}

func (self *argHolderBuilder) SetAutoGenerateCertificates(autoGenerateCertificates bool) *argHolderBuilder {
	self.holder.autoGenerateCertificates = autoGenerateCertificates
	return self
}

func (self *argHolderBuilder) SetEnableInsecureLogin(enableInsecureLogin bool) *argHolderBuilder {
	self.holder.enableInsecureLogin = enableInsecureLogin
	return self
}

func (self *argHolderBuilder) SetEnableSettingsAuthorizer(enableSettingsAuthorizer bool) *argHolderBuilder {
	self.holder.enableSettingsAuthorizer = enableSettingsAuthorizer
	return self
}

func GetArgHolderBuilder() *argHolderBuilder {
	return builder
}
