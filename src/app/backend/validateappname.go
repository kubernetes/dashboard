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

package main

import (
	k8serrors "k8s.io/kubernetes/pkg/api/errors"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// Specification for application name validation request.
type AppNameValiditySpec struct {
	// Name of the application.
	Name string `json:"name"`

	// Namescpace of the application.
	Namespace string `json:"namespace"`
}

// Describes validity of the application name.
type AppNameValidity struct {
	// True when the applcation name is valid.
	Valid bool `json:"valid"`
}

// Validates application name. When error is returned, name validity could not be determined.
func ValidateAppName(spec *AppNameValiditySpec, client client.Interface) (*AppNameValidity, error) {
	isValidRc := false
	isValidService := false

	_, err := client.ReplicationControllers(spec.Namespace).Get(spec.Name)
	if err != nil {
		if isNotFoundError(err) {
			isValidRc = true
		} else {
			return nil, err
		}
	}

	_, err = client.Services(spec.Namespace).Get(spec.Name)
	if err != nil {
		if isNotFoundError(err) {
			isValidService = true
		} else {
			return nil, err
		}
	}

	return &AppNameValidity{Valid: isValidRc && isValidService}, nil
}

// Returns true when the given error is 404-NotFound error.
func isNotFoundError(err error) bool {
	statusErr, ok := err.(*k8serrors.StatusError)
	if !ok {
		return false
	}
	return statusErr.ErrStatus.Code == 404
}
