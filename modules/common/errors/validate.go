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
