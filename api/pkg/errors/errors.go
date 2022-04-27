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

package errors

import (
	"fmt"
	"net/http"

	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
)

var _ error = &errors.StatusError{}

// NewUnauthorized returns an error indicating the client is not authorized to perform the requested
// action.
func NewUnauthorized(reason string) *errors.StatusError {
	return errors.NewUnauthorized(reason)
}

// NewTokenExpired return a statusError
// which is an error intended for consumption by a REST API server; it can also be
// reconstructed by clients from a REST response. Public to allow easy type switches.
func NewTokenExpired(reason string) *errors.StatusError {
	return &errors.StatusError{
		ErrStatus: metav1.Status{
			Status:  metav1.StatusFailure,
			Code:    http.StatusUnauthorized,
			Reason:  metav1.StatusReasonExpired,
			Message: reason,
		},
	}
}

// NewBadRequest creates an error that indicates that the request is invalid and can not be processed.
func NewBadRequest(reason string) *errors.StatusError {
	return errors.NewBadRequest(reason)
}

// NewInvalid return a statusError
// which is an error intended for consumption by a REST API server; it can also be
// reconstructed by clients from a REST response. Public to allow easy type switches.
func NewInvalid(reason string) *errors.StatusError {
	return &errors.StatusError{
		ErrStatus: metav1.Status{
			Status:  metav1.StatusFailure,
			Code:    http.StatusInternalServerError,
			Reason:  metav1.StatusReasonInvalid,
			Message: reason,
		},
	}
}

// NewNotFound return a statusError
// which is an error intended for consumption by a REST API server; it can also be
// reconstructed by clients from a REST response. Public to allow easy type switches.
func NewNotFound(reason string) *errors.StatusError {
	return &errors.StatusError{
		ErrStatus: metav1.Status{
			Status:  metav1.StatusFailure,
			Code:    http.StatusNotFound,
			Reason:  metav1.StatusReasonNotFound,
			Message: reason,
		},
	}
}

// NewInternal return a statusError
// which is an error intended for consumption by a REST API server; it can also be
// reconstructed by clients from a REST response. Public to allow easy type switches.
func NewInternal(reason string) *errors.StatusError {
	return &errors.StatusError{ErrStatus: metav1.Status{
		Status: metav1.StatusFailure,
		Code:   http.StatusInternalServerError,
		Reason: metav1.StatusReasonInternalError,
		Details: &metav1.StatusDetails{
			Causes: []metav1.StatusCause{{Message: reason}},
		},
		Message: fmt.Sprintf("Internal error occurred: %s", reason),
	}}
}

// NewUnexpectedObject return a statusError
// which is an error intended for consumption by a REST API server; it can also be
// reconstructed by clients from a REST response. Public to allow easy type switches.
func NewUnexpectedObject(obj runtime.Object) *errors.StatusError {
	return &errors.StatusError{
		ErrStatus: metav1.Status{
			Status:  metav1.StatusFailure,
			Code:    http.StatusInternalServerError,
			Reason:  metav1.StatusReasonInternalError,
			Message: errors.FromObject(obj).Error(),
		},
	}
}

// NewGenericResponse return a statusError
// which is an error intended for consumption by a REST API server; it can also be
// reconstructed by clients from a REST response. Public to allow easy type switches
// by switch the error code.
func NewGenericResponse(code int, serverMessage string) *errors.StatusError {
	reason := metav1.StatusReasonUnknown
	message := fmt.Sprintf("the server responded with the status code %d but did not return more information", code)
	switch code {
	case http.StatusNotFound:
		reason = metav1.StatusReasonNotFound
		message = "the server could not find the requested resource"
	case http.StatusBadRequest:
		reason = metav1.StatusReasonBadRequest
		message = "the server rejected our request for an unknown reason"
	case http.StatusUnauthorized:
		reason = metav1.StatusReasonUnauthorized
		message = "the server has asked for the client to provide credentials"
	case http.StatusForbidden:
		reason = metav1.StatusReasonForbidden
		// the server message has details about who is trying to perform what action.  Keep its message.
		message = serverMessage
	case http.StatusConflict:
		reason = metav1.StatusReasonConflict
		message = serverMessage
	case http.StatusNotAcceptable:
		reason = metav1.StatusReasonNotAcceptable
		// the server message has details about what types are acceptable
		message = serverMessage
	case http.StatusUnsupportedMediaType:
		reason = metav1.StatusReasonUnsupportedMediaType
		// the server message has details about what types are acceptable
		message = serverMessage
	case http.StatusMethodNotAllowed:
		reason = metav1.StatusReasonMethodNotAllowed
		message = "the server does not allow this method on the requested resource"
	case http.StatusUnprocessableEntity:
		reason = metav1.StatusReasonInvalid
		message = "the server rejected our request due to an error in our request"
	case http.StatusServiceUnavailable:
		reason = metav1.StatusReasonServiceUnavailable
		message = "the server is currently unable to handle the request"
	case http.StatusGatewayTimeout:
		reason = metav1.StatusReasonTimeout
		message = "the server was unable to return a response in the time allotted, but may still be processing the request"
	case http.StatusTooManyRequests:
		reason = metav1.StatusReasonTooManyRequests
		message = "the server has received too many requests and has asked us to try again later"
	default:
		if code >= 500 {
			reason = metav1.StatusReasonInternalError
			message = fmt.Sprintf("an error on the server (%q) has prevented the request from succeeding", serverMessage)
		}
	}

	return &errors.StatusError{ErrStatus: metav1.Status{
		Status:  metav1.StatusFailure,
		Code:    int32(code),
		Reason:  reason,
		Message: message,
	}}
}

// IsTokenExpired determines if the err is an error which errStatus' message is MsgTokenExpiredError
func IsTokenExpired(err error) bool {
	statusErr, ok := err.(*errors.StatusError)
	if !ok {
		return false
	}

	return statusErr.ErrStatus.Message == MsgTokenExpiredError
}

// IsAlreadyExists determines if the err is an error which indicates that a specified resource already exists.
func IsAlreadyExists(err error) bool {
	return errors.IsAlreadyExists(err)
}

// IsUnauthorized determines if err is an error which indicates that the request is unauthorized and
// requires authentication by the user.
func IsUnauthorized(err error) bool {
	return errors.IsUnauthorized(err)
}
