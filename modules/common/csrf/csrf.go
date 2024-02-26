package csrf

import (
	"crypto/rand"
)

var (
	// csrfKey is kept in-memory only. This requires all apps that use it
	// to ensure session stickiness otherwise CSRF protection check will fail.
	csrfKey = ""
)

type csrfManager struct {
}

func init() {
	csrfKey = generateCSRFKey()
}

// generateCSRFKey generates random csrf key
func generateCSRFKey() string {
	bytes := make([]byte, 256)
	_, err := rand.Read(bytes)
	if err != nil {
		panic("could not generate csrf key")
	}

	return string(bytes)
}

type Option func(*csrfManager)

func Init(options ...Option) {

}

func Key() string {
	return csrfKey
}
