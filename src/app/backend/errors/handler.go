// Copyright 2017 The Kubernetes Dashboard Authors.
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

package errors

import (
	"k8s.io/apimachinery/pkg/api/errors"
	"log"
	"net/http"
)

// NonCriticalErrors is an array of error statuses, that are non-critical. That means, that this error can be silenced
// and displayed to the user as a warning on the frontend side.
var NonCriticalErrors = []int32{http.StatusForbidden}

// HandleError handles single error, that occurred during API GET call. If it is not critical, then it will be returned
// as a part of error array. Otherwise, it will be returned as a second value. Usage of this functions allows to
// distinguish critical errors from non-critical ones. It is needed to handle them in a different way.
func HandleError(err error) ([]error, error) {
	nonCriticalErrors := make([]error, 0)
	return AppendError(err, nonCriticalErrors)
}

// AppendError handles single error, that occurred during API GET call. If it is not critical, then it will be returned
// as a part of error array. Otherwise, it will be returned as a second value. Usage of this functions allows to
// distinguish critical errors from non-critical ones. It is needed to handle them in a different way.
func AppendError(err error, nonCriticalErrors []error) ([]error, error) {
	if err != nil {
		if isErrorCritical(err) {
			return nonCriticalErrors, err
		} else {
			log.Printf("Non-critical error occurred during resource retrieval: %s", err)
			nonCriticalErrors = append(nonCriticalErrors, err)
		}
	}
	return nonCriticalErrors, nil
}

func isErrorCritical(err error) bool {
	status, ok := err.(*errors.StatusError)
	if !ok {
		// Assume, that error is critical if it cannot be mapped.
		return true
	}
	return !contains(NonCriticalErrors, status.ErrStatus.Code)
}

func contains(s []int32, e int32) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}
