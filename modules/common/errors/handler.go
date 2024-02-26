package errors

import (
	"errors"
	"net/http"

	"github.com/emicklei/go-restful/v3"
	k8sErrors "k8s.io/apimachinery/pkg/api/errors"
)

// nonCriticalErrors is an array of error statuses, that are non-critical. That means, that this error can be
// silenced and displayed to the user as a warning on the frontend side.
var nonCriticalErrors = []int32{http.StatusForbidden, http.StatusUnauthorized}

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
	var (
		statusError   *k8sErrors.StatusError
		statusCode    = http.StatusInternalServerError
		isStatusError = errors.As(err, &statusError)
	)

	if isStatusError && statusError.Status().Code > 0 {
		statusCode = int(statusError.Status().Code)
	}

	response.AddHeader("Content-Type", "text/plain")
	response.WriteErrorString(statusCode, err.Error()+"\n")
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
