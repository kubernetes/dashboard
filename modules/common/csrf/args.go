// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
	argCSRFKey     = pflag.String("csrf-key", helpers.GetEnv("CSRF_KEY", helpers.Random64BaseEncodedBytes(256)), "Base64 encoded random 256 bytes key. Can be loaded from 'CSRF_KEY' environment variable.")
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
		klog.Errorf("Could not validate CSRF key. Expected size %d, got %d", keySizeBytes, len(decoded))
	}

	decodedCSRFKey = string(decoded)
}

func Key() string {
	if len(decodedCSRFKey) == 0 {
		klog.Fatal("CSRF key was not properly initialized. Run 'csrf.Ensure()' first.")
	}

	return decodedCSRFKey
}
