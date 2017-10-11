package cert

import (
	"log"
	"os"

	certapi "github.com/kubernetes/dashboard/src/app/backend/cert/api"
)

type Manager struct {
	creator certapi.Creator
	certDir string
}

func (self *Manager) GenerateCertificates() {
	if self.keyFileExists() && self.certFileExists() {
		log.Println("Certificates already exist. Skipping.")
		return
	}

	key := self.creator.GenerateKey()
	cert := self.creator.GenerateCertificate(key)
	self.creator.StoreCertificates(self.certDir, key, cert)
	log.Println("Successfuly created and stored certificates")
}

func (self *Manager) keyFileExists() bool {
	return self.exists(self.path(self.creator.GetKeyFileName()))
}

func (self *Manager) certFileExists() bool {
	return self.exists(self.path(self.creator.GetCertFileName()))
}

func (self *Manager) path(certFile string) string {
	return self.certDir + string(os.PathSeparator) + certFile
}

func (self *Manager) exists(file string) bool {
	_, err := os.Stat(file)
	return !os.IsNotExist(err)
}

func NewCertManager(creator certapi.Creator, certDir string) certapi.Manager {
	return &Manager{creator: creator, certDir: certDir}
}
