package common

import (
	"net/http"
)

type RequestGetter func() *http.Request

type CachedClientOptions struct {
	// Token is the authentication token to use for the requests.
	Token string

	// RequestGetter is a function that returns an original HTTP request
	// used to create the client.
	RequestGetter RequestGetter
}
