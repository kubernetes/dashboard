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

import (
	"net"

	"k8s.io/dashboard/certificates/api"
)

var Holder = &holder{}

// Argument holder structure. It is private to make sure that only 1 instance can be created. It holds all
// arguments values passed to Dashboard binary.
type holder struct {
	insecurePort            int
	port                    int
	tokenTTL                int
	metricClientCheckPeriod int

	insecureBindAddress net.IP
	bindAddress         net.IP

	defaultCertDir         string
	certFile               string
	keyFile                string
	apiServerHost          string
	apiServerSkipTLSVerify bool
	metricsProvider        string
	heapsterHost           string
	sidecarHost            string
	kubeConfigFile         string
	apiLogLevel            string
	namespace              string

	authenticationMode []string

	autoGenerateCertificates  bool
	enableInsecureLogin       bool
	disableSettingsAuthorizer bool

	enableSkipLogin bool
}

// GetInsecurePort 'insecure-port' argument of Dashboard binary.
func (self *holder) GetInsecurePort() int {
	return self.insecurePort
}

// GetPort 'port' argument of Dashboard binary.
func (self *holder) GetPort() int {
	return self.port
}

// GetTokenTTL 'token-ttl' argument of Dashboard binary.
func (self *holder) GetTokenTTL() int {
	return self.tokenTTL
}

// GetMetricClientCheckPeriod 'metric-client-check-period' argument of Dashboard binary.
func (self *holder) GetMetricClientCheckPeriod() int {
	return self.metricClientCheckPeriod
}

// GetInsecureBindAddress 'insecure-bind-address' argument of Dashboard binary.
func (self *holder) GetInsecureBindAddress() net.IP {
	return self.insecureBindAddress
}

// GetBindAddress 'bind-address' argument of Dashboard binary.
func (self *holder) GetBindAddress() net.IP {
	return self.bindAddress
}

// GetDefaultCertDir 'default-cert-dir' argument of Dashboard binary.
func (self *holder) GetDefaultCertDir() string {
	return self.defaultCertDir
}

// GetCertFile 'tls-cert-file' argument of Dashboard binary.
func (self *holder) GetCertFile() string {
	if len(self.certFile) == 0 && self.autoGenerateCertificates {
		return api.DashboardCertName
	}

	return self.certFile
}

// GetKeyFile 'tls-key-file' argument of Dashboard binary.
func (self *holder) GetKeyFile() string {
	if len(self.keyFile) == 0 && self.autoGenerateCertificates {
		return api.DashboardKeyName
	}

	return self.keyFile
}

// GetApiServerHost 'apiserver-host' argument of Dashboard binary.
func (self *holder) GetApiServerHost() string {
	return self.apiServerHost
}

// GetApiServerSkipTLSVerify 'apiserver-skip-tls-verify' argument of Dashboard binary.
func (self *holder) GetApiServerSkipTLSVerify() bool {
	return self.apiServerSkipTLSVerify
}

// GetMetricsProvider 'metrics-provider' argument of Dashboard binary.
func (self *holder) GetMetricsProvider() string {
	return self.metricsProvider
}

// GetHeapsterHost 'heapster-host' argument of Dashboard binary.
func (self *holder) GetHeapsterHost() string {
	return self.heapsterHost
}

// GetSidecarHost 'sidecar-host' argument of Dashboard binary.
func (self *holder) GetSidecarHost() string {
	return self.sidecarHost
}

// GetKubeConfigFile 'kubeconfig' argument of Dashboard binary.
func (self *holder) GetKubeConfigFile() string {
	return self.kubeConfigFile
}

// GetAPILogLevel 'api-log-level' argument of Dashboard binary.
func (self *holder) GetAPILogLevel() string {
	return self.apiLogLevel
}

// GetAuthenticationMode 'authentication-mode' argument of Dashboard binary.
func (self *holder) GetAuthenticationMode() []string {
	return self.authenticationMode
}

// GetAutoGenerateCertificates 'auto-generate-certificates' argument of Dashboard binary.
func (self *holder) GetAutoGenerateCertificates() bool {
	return self.autoGenerateCertificates
}

// GetEnableInsecureLogin 'enable-insecure-login' argument of Dashboard binary.
func (self *holder) GetEnableInsecureLogin() bool {
	return self.enableInsecureLogin
}

// GetDisableSettingsAuthorizer 'disable-settings-authorizer' argument of Dashboard binary.
func (self *holder) GetDisableSettingsAuthorizer() bool {
	return self.disableSettingsAuthorizer
}

// GetEnableSkipLogin 'enable-skip-login' argument of Dashboard binary.
func (self *holder) GetEnableSkipLogin() bool {
	return self.enableSkipLogin
}

// GetNamespace 'namespace' argument of Dashboard binary.
func (self *holder) GetNamespace() string {
	return self.namespace
}
