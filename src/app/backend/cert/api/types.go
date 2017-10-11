package api

const (
	// Resource information that are used as certificates storage. Can be accessible by multiple dashboard replicas.
	CertificatesHolderName      = "kubernetes-dashboard-certs"
	CertificatesHolderNamespace = "kube-system"

	DashboardCertName = "dashboard.crt"
	DashboardKeyName  = "dashboard.key"
)

type Manager interface {
	GenerateCertificates()
}

type Creator interface {
	GenerateKey() interface{}
	GenerateCertificate(key interface{}) []byte
	StoreCertificates(path string, key interface{}, certBytes []byte)
	GetKeyFileName() string
	GetCertFileName() string
}

// TODO(floreks): Implement certificate signing
type Signer interface{}
