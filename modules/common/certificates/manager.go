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

package certificates

import (
	"crypto/tls"
	"log"
	"os"

	"k8s.io/dashboard/certificates/api"
)

// Manager is used to implement cert/api/types.Manager interface. See Manager for more information.
type Manager struct {
	creator      api.Creator
	certDir      string
	autogenerate bool
}

// GetCertificates implements Manager interface. See Manager for more information.
func (in *Manager) GetCertificates() ([]tls.Certificate, error) {
	// Make the autogenerate the top priority option.
	if in.autogenerate {
		key := in.creator.GenerateKey()
		cert := in.creator.GenerateCertificate(key)
		log.Println("Successfully created certificates")
		keyPEM, certPEM, err := in.creator.KeyCertPEMBytes(key, cert)
		if err != nil {
			return []tls.Certificate{}, err
		}
		certificate, err := tls.X509KeyPair(certPEM, keyPEM)
		return []tls.Certificate{certificate}, err
	}

	// When autogenerate is disabled and provided cert files exist use them.
	if in.keyFileExists() && in.certFileExists() && !in.autogenerate {
		log.Println("Certificates already exist. Returning.")
		certificate, err := tls.LoadX509KeyPair(
			in.path(in.creator.GetCertFileName()),
			in.path(in.creator.GetKeyFileName()),
		)

		return []tls.Certificate{certificate}, err
	}

	return nil, nil
}

func (in *Manager) GetCertificatePaths() (string, string, error) {
	// Make the autogenerate the top priority option.
	if in.autogenerate {
		key := in.creator.GenerateKey()
		cert := in.creator.GenerateCertificate(key)
		log.Println("Successfully created certificates")
		keyPEM, certPEM, err := in.creator.KeyCertPEMBytes(key, cert)
		if err != nil {
			return "", "", err
		}
		certPath, keyPath := in.creator.StoreCertificates(in.certDir, certPEM, keyPEM)
		return certPath, keyPath, nil
	}

	// When autogenerate is disabled and provided cert files exist use them.
	if in.keyFileExists() && in.certFileExists() && !in.autogenerate {
		log.Println("Certificates already exist. Returning.")

		return in.path(in.creator.GetCertFileName()), in.path(in.creator.GetKeyFileName()), nil
	}

	return "", "", nil
}

func (in *Manager) keyFileExists() bool {
	return in.exists(in.path(in.creator.GetKeyFileName()))
}

func (in *Manager) certFileExists() bool {
	return in.exists(in.path(in.creator.GetCertFileName()))
}

func (in *Manager) path(certFile string) string {
	return in.certDir + string(os.PathSeparator) + certFile
}

func (in *Manager) exists(file string) bool {
	_, err := os.Stat(file)
	return !os.IsNotExist(err)
}

// NewCertManager creates Manager object.
func NewCertManager(creator api.Creator, certDir string, autogenerate bool) api.Manager {
	return &Manager{creator: creator, certDir: certDir, autogenerate: autogenerate}
}
