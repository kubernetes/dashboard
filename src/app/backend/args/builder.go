// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package args

import "net"

var builder = &holderBuilder{holder: Holder}

// Used to build argument holder structure. It is private to make sure that only 1 instance can be created
// that modifies singleton instance of argument holder.
type holderBuilder struct {
	holder *holder
}

// SetInsecurePort 'insecure-port' argument of Dashboard binary.
func (self *holderBuilder) SetInsecurePort(port int) *holderBuilder {
	self.holder.insecurePort = port
	return self
}

// SetPort 'port' argument of Dashboard binary.
func (self *holderBuilder) SetPort(port int) *holderBuilder {
	self.holder.port = port
	return self
}

// SetTokenTTL 'token-ttl' argument of Dashboard binary.
func (self *holderBuilder) SetTokenTTL(ttl int) *holderBuilder {
	self.holder.tokenTTL = ttl
	return self
}

// SetMetricClientCheckPeriod 'metric-client-check-period' argument of Dashboard binary.
func (self *holderBuilder) SetMetricClientCheckPeriod(period int) *holderBuilder {
	self.holder.metricClientCheckPeriod = period
	return self
}

// SetInsecureBindAddress 'insecure-bind-address' argument of Dashboard binary.
func (self *holderBuilder) SetInsecureBindAddress(ip net.IP) *holderBuilder {
	self.holder.insecureBindAddress = ip
	return self
}

// SetBindAddress 'bind-address' argument of Dashboard binary.
func (self *holderBuilder) SetBindAddress(ip net.IP) *holderBuilder {
	self.holder.bindAddress = ip
	return self
}

// SetDefaultCertDir 'default-cert-dir' argument of Dashboard binary.
func (self *holderBuilder) SetDefaultCertDir(certDir string) *holderBuilder {
	self.holder.defaultCertDir = certDir
	return self
}

// SetCertFile 'tls-cert-file' argument of Dashboard binary.
func (self *holderBuilder) SetCertFile(certFile string) *holderBuilder {
	self.holder.certFile = certFile
	return self
}

// SetKeyFile 'tls-key-file' argument of Dashboard binary.
func (self *holderBuilder) SetKeyFile(keyFile string) *holderBuilder {
	self.holder.keyFile = keyFile
	return self
}

// SetApiServerHost 'api-server-host' argument of Dashboard binary.
func (self *holderBuilder) SetApiServerHost(apiServerHost string) *holderBuilder {
	self.holder.apiServerHost = apiServerHost
	return self
}

// SetMetricsProvider 'metrics-provider' argument of Dashboard binary.
func (self *holderBuilder) SetMetricsProvider(metricsProvider string) *holderBuilder {
	self.holder.metricsProvider = metricsProvider
	return self
}

// SetHeapsterHost 'heapster-host' argument of Dashboard binary.
func (self *holderBuilder) SetHeapsterHost(heapsterHost string) *holderBuilder {
	self.holder.heapsterHost = heapsterHost
	return self
}

// SetSidecarHost 'sidecar-host' argument of Dashboard binary.
func (self *holderBuilder) SetSidecarHost(sidecarHost string) *holderBuilder {
	self.holder.sidecarHost = sidecarHost
	return self
}

// SetKubeConfigFile 'kubeconfig' argument of Dashboard binary.
func (self *holderBuilder) SetKubeConfigFile(kubeConfigFile string) *holderBuilder {
	self.holder.kubeConfigFile = kubeConfigFile
	return self
}

// SetSystemBanner 'system-banner' argument of Dashboard binary.
func (self *holderBuilder) SetSystemBanner(systemBanner string) *holderBuilder {
	self.holder.systemBanner = systemBanner
	return self
}

// SetSystemBannerSeverity 'system-banner-severity' argument of Dashboard binary.
func (self *holderBuilder) SetSystemBannerSeverity(systemBannerSeverity string) *holderBuilder {
	self.holder.systemBannerSeverity = systemBannerSeverity
	return self
}

// SetLogLevel 'api-log-level' argument of Dashboard binary.
func (self *holderBuilder) SetAPILogLevel(apiLogLevel string) *holderBuilder {
	self.holder.apiLogLevel = apiLogLevel
	return self
}

// SetAuthenticationMode 'authentication-mode' argument of Dashboard binary.
func (self *holderBuilder) SetAuthenticationMode(authMode []string) *holderBuilder {
	self.holder.authenticationMode = authMode
	return self
}

// SetAutoGenerateCertificates 'auto-generate-certificates' argument of Dashboard binary.
func (self *holderBuilder) SetAutoGenerateCertificates(autoGenerateCertificates bool) *holderBuilder {
	self.holder.autoGenerateCertificates = autoGenerateCertificates
	return self
}

// SetEnableInsecureLogin 'enable-insecure-login' argument of Dashboard binary.
func (self *holderBuilder) SetEnableInsecureLogin(enableInsecureLogin bool) *holderBuilder {
	self.holder.enableInsecureLogin = enableInsecureLogin
	return self
}

// SetDisableSettingsAuthorizer 'disable-settings-authorizer' argument of Dashboard binary.
func (self *holderBuilder) SetDisableSettingsAuthorizer(disableSettingsAuthorizer bool) *holderBuilder {
	self.holder.disableSettingsAuthorizer = disableSettingsAuthorizer
	return self
}

// SetEnableSkipLogin 'enable-skip-login' argument of Dashboard binary.
func (self *holderBuilder) SetEnableSkipLogin(enableSkipLogin bool) *holderBuilder {
	self.holder.enableSkipLogin = enableSkipLogin
	return self
}

// SetNamespace 'namespace' argument of Dashboard binary.
func (self *holderBuilder) SetNamespace(namespace string) *holderBuilder {
	self.holder.namespace = namespace
	return self
}

// SetLocaleConfig 'locale-config' argument of Dashboard binary.
func (self *holderBuilder) SetLocaleConfig(localeConfig string) *holderBuilder {
	self.holder.localeConfig = localeConfig
	return self
}

// GetHolderBuilder returns singleton instance of argument holder builder.
func GetHolderBuilder() *holderBuilder {
	return builder
}
