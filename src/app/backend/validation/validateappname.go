// Copyright 2015 Google Inc. All Rights Reserved.
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

	"k8s.io/apimachinery/pkg/api/errors"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	client "k8s.io/client-go/kubernetes"
)

// AppNameValiditySpec is a specification for application name validation request.
type AppNameValiditySpec struct {
	// Name of the application.
	Name string `json:"name"`

	// Namespace of the application.
	Namespace string `json:"namespace"`
}

// AppNameValidity describes validity of the application name.
type AppNameValidity struct {
	// True when the application name is valid.
	Valid bool `json:"valid"`
}

// ValidateAppName validates application name. When error is returned, name validity could not be
// determined.
func ValidateAppName(spec *AppNameValiditySpec, client client.Interface) (*AppNameValidity, error) {
	log.Printf("Validating %s application name in %s namespace", spec.Name, spec.Namespace)

	isValidRc := false
	isValidService := false

	_, err := client.CoreV1().ReplicationControllers(spec.Namespace).Get(spec.Name, metaV1.GetOptions{})
	if err != nil {
		if isNotFoundError(err) {
			isValidRc = true
		} else {
			return nil, err
		}
	}

	_, err = client.CoreV1().Services(spec.Namespace).Get(spec.Name, metaV1.GetOptions{})
	if err != nil {
		if isNotFoundError(err) {
			isValidService = true
		} else {
			return nil, err
		}
	}

	isValid := isValidRc && isValidService

	log.Printf("Validation result for %s application name in %s namespace is %t", spec.Name,
		spec.Namespace, isValid)

	return &AppNameValidity{Valid: isValid}, nil
}

// Returns true when the given error is 404-NotFound error.
func isNotFoundError(err error) bool {
	statusErr, ok := err.(*errors.StatusError)
	if !ok {
		return false
	}
	return statusErr.ErrStatus.Code == 404
}
