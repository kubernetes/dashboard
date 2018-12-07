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

package api

import "strings"

// ToAuthenticationModes transforms array of authentication mode strings to valid AuthenticationModes type.
func ToAuthenticationModes(modes []string) AuthenticationModes {
	result := AuthenticationModes{}
	modesMap := map[string]bool{}

	for _, mode := range []AuthenticationMode{Token, Basic} {
		modesMap[mode.String()] = true
	}

	for _, mode := range modes {
		if _, exists := modesMap[mode]; exists {
			result.Add(AuthenticationMode(mode))
		}
	}

	return result
}

// List of protected resources that should be filtered out from dashboard UI.
var protectedResources = []ProtectedResource{
	{EncryptionKeyHolderName, EncryptionKeyHolderNamespace},
	{CertificateHolderSecretName, CertificateHolderSecretNamespace},
}

// ShouldRejectRequest returns true if url contains name and namespace of resource that should be filtered out from
// dashboard.
func ShouldRejectRequest(url string) bool {
	for _, protectedResource := range protectedResources {
		if strings.Contains(url, protectedResource.ResourceName) && strings.Contains(url, protectedResource.ResourceNamespace) {
			return true
		}
	}

	return false
}
