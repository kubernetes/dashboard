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
	insecurePort int
	port         int

	insecureBindAddress net.IP
	bindAddress         net.IP

	defaultCertDir       string
	certFile             string
	keyFile              string
	localeConfig         string
	systemBanner         string
	systemBannerSeverity string

	autoGenerateCertificates bool
}

// GetInsecurePort 'insecure-port' argument of Dashboard binary.
func (self *holder) GetInsecurePort() int {
	return self.insecurePort
}

// GetPort 'port' argument of Dashboard binary.
func (self *holder) GetPort() int {
	return self.port
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

// GetSystemBanner 'system-banner' argument of Dashboard binary.
func (self *holder) GetSystemBanner() string {
	return self.systemBanner
}

// GetSystemBannerSeverity 'system-banner-severity' argument of Dashboard binary.
func (self *holder) GetSystemBannerSeverity() string {
	return self.systemBannerSeverity
}

// GetAutoGenerateCertificates 'auto-generate-certificates' argument of Dashboard binary.
func (self *holder) GetAutoGenerateCertificates() bool {
	return self.autoGenerateCertificates
}

// GetLocaleConfig 'locale-config' argument of Dashboard binary.
func (self *holder) GetLocaleConfig() string {
	return self.localeConfig
}
