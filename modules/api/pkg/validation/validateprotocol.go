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

package validation

import (
	"log"

	api "k8s.io/api/core/v1"
)

// ProtocolValiditySpec is a specification of protocol validation request.
type ProtocolValiditySpec struct {
	// Protocol type
	Protocol api.Protocol `json:"protocol"`

	// Service type. LoadBalancer(true)/NodePort(false).
	IsExternal bool `json:"isExternal"`
}

// ProtocolValidity describes validity of the protocol.
type ProtocolValidity struct {
	// True when the selected protocol is valid for selected service type.
	Valid bool `json:"valid"`
}

// ValidateProtocol validates protocol based on whether created service is set to NodePort or NodeBalancer type.
func ValidateProtocol(spec *ProtocolValiditySpec) *ProtocolValidity {
	log.Printf("Validating %s protocol for service with external set to %v", spec.Protocol, spec.IsExternal)

	isValid := true
	if spec.Protocol == api.ProtocolUDP && spec.IsExternal {
		isValid = false
	}

	log.Printf("Validation result for %s protocol is %v", spec.Protocol, isValid)
	return &ProtocolValidity{Valid: isValid}
}
