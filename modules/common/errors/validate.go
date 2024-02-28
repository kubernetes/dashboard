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

package errors

import (
	"errors"

	k8serrors "k8s.io/apimachinery/pkg/api/errors"
)

// IsTokenExpired determines if the error is an error which errStatus message is MsgTokenExpiredError
func IsTokenExpired(err error) bool {
	var statusErr *k8serrors.StatusError
	if ok := errors.As(err, &statusErr); !ok {
		return false
	}

	return statusErr.ErrStatus.Message == MsgTokenExpiredError
}

// IsAlreadyExists determines if a specified resource already exists.
func IsAlreadyExists(err error) bool {
	return k8serrors.IsAlreadyExists(err)
}

// IsUnauthorized determines if request is unauthorized and requires authentication by the user.
func IsUnauthorized(err error) bool {
	return k8serrors.IsUnauthorized(err)
}

// IsForbidden determines if request has been forbidden and requires extra privileges for the user.
func IsForbidden(err error) bool {
	return k8serrors.IsForbidden(err)
}

func IsNotFound(err error) bool { return k8serrors.IsNotFound(err) }
