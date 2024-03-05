package csrf

import (
	"encoding/base64"
	"os"

	"github.com/spf13/pflag"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/helpers"
)

const keySizeBytes = 256

var (
	argCSRFKey     = pflag.String("csrf-key", helpers.GetEnv("CSRF_KEY", ""), "Base64 encoded random 256 bytes key. Can be loaded from 'CSRF_KEY' environment variable.")
	decodedCSRFKey = ""
)

func Ensure() {
	key := *argCSRFKey

	decoded, err := base64.StdEncoding.DecodeString(key)
	if err != nil {
		klog.ErrorS(err, "Could not decode CSRF key")
		os.Exit(255)
	}

	if len(decoded) != keySizeBytes {
		klog.Fatalf("Could not validate CSRF key. Expected size %d, got %d.", keySizeBytes, len(decoded))
	}

	decodedCSRFKey = string(decoded)
}

func Key() string {
	if len(decodedCSRFKey) == 0 {
		klog.Fatal("CSRF key was not properly initialized. Run 'csrf.Ensure()' first.")
	}

	return decodedCSRFKey
}
