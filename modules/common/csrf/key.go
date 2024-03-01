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
	"crypto/rand"
)

var (
	// csrfKey is kept in-memory only. This requires all apps that use it
	// to ensure session stickiness otherwise CSRF protection check will fail.
	csrfKey = ""
)

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

func Key() string {
	return csrfKey
}
