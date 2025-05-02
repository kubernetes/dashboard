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
	"net/http"

	"github.com/emicklei/go-restful/v3"
	k8sErrors "k8s.io/apimachinery/pkg/api/errors"
)

// nonCriticalErrors is an array of error statuses, that are non-critical. That means, that this error can be
// silenced and displayed to the user as a warning on the frontend side.
var nonCriticalErrors = []int32{http.StatusForbidden}

func HandleError(err error) (int, error) {
	if IsUnauthorized(err) {
		return http.StatusUnauthorized, NewUnauthorized(MsgLoginUnauthorizedError)
	}

	if IsForbidden(err) {
		return http.StatusForbidden, NewForbidden(MsgForbiddenError, err)
	}

	return http.StatusInternalServerError, err
}

// ExtractErrors handles single error, that occurred during API GET call. If it is not critical, then it will be
// returned as a part of error array. Otherwise, it will be returned as a second value. Usage of this function
// allows to distinguish critical errors from non-critical ones. It is needed to handle them in a different way.
func ExtractErrors(err error) ([]error, error) {
	nonCriticalErrors := make([]error, 0)
	return AppendError(err, nonCriticalErrors)
}

// HandleInternalError writes the given error to the response and sets appropriate HTTP status headers.
func HandleInternalError(response *restful.Response, err error) {
	code, err := HandleError(err)

	response.AddHeader("Content-Type", "text/plain")
	_ = response.WriteError(code, err)
}

// AppendError handles single error, that occurred during API GET call. If it is not critical, then it will be
// returned as a part of error array. Otherwise, it will be returned as a second value. Usage of this functions
// allows to distinguish critical errors from non-critical ones. It is needed to handle them in a different way.
func AppendError(err error, nonCriticalErrors []error) ([]error, error) {
	if err != nil {
		if isErrorCritical(err) {
			return nonCriticalErrors, LocalizeError(err)
		}
		// klog.Printf("Non-critical error occurred during resource retrieval: %s", err)
		nonCriticalErrors = appendMissing(nonCriticalErrors, LocalizeError(err))
	}
	return nonCriticalErrors, nil
}

// MergeErrors merges multiple non-critical error arrays into one array.
func MergeErrors(errorArraysToMerge ...[]error) (mergedErrors []error) {
	for _, errorArray := range errorArraysToMerge {
		mergedErrors = appendMissing(mergedErrors, errorArray...)
	}
	return
}

func isErrorCritical(err error) bool {
	var (
		status        *k8sErrors.StatusError
		isStatusError = errors.As(err, &status)
	)

	if !isStatusError {
		// Assume, that error is critical if it cannot be mapped.
		return true
	}

	return !contains(nonCriticalErrors, status.ErrStatus.Code)
}

func appendMissing(slice []error, toAppend ...error) []error {
	m := make(map[string]bool, 0)

	for _, s := range slice {
		m[s.Error()] = true
	}

	for _, a := range toAppend {
		_, ok := m[a.Error()]
		if !ok {
			slice = append(slice, a)
			m[a.Error()] = true
		}
	}

	return slice
}

func contains(s []int32, e int32) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}
