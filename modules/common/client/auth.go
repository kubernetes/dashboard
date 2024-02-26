package client

import (
	"net/http"
	"strings"
)

const (
	// authorizationHeader is the default authorization header name.
	authorizationHeader = "Authorization"
	// authorizationTokenPrefix is the default bearer token prefix.
	authorizationTokenPrefix = "Bearer "
)

func HasAuthorizationHeader(req *http.Request) bool {
	header := req.Header.Get(authorizationHeader)
	if len(header) == 0 {
		return false
	}

	token := extractBearerToken(header)
	return strings.HasPrefix(header, authorizationTokenPrefix) && len(token) > 0
}

func GetBearerToken(req *http.Request) string {
	header := req.Header.Get(authorizationHeader)
	return extractBearerToken(header)
}

func SetAuthorizationHeader(req *http.Request, token string) {
	req.Header.Set(authorizationHeader, authorizationTokenPrefix+token)
}

func extractBearerToken(header string) string {
	return strings.TrimPrefix(header, authorizationTokenPrefix)
}
