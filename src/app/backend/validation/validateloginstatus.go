package validation

import "github.com/emicklei/go-restful"

// LoginStatus TODO
type LoginStatus struct {
	// True when token header indicating logged in user is found in request.
	TokenPresent  bool `json:"tokenPresent"`
	// True when authorization header indicating logged in user is found in request.
	HeaderPresent bool `json:"headerPresent"`
	// True if dashboard is configured to use HTTPS connection. It is required for secure
	// data exchange during login operation.
	HTTPSMode     bool `json:"httpsMode"`
}

// ValidateLoginStatus TODO
func ValidateLoginStatus(request *restful.Request) *LoginStatus {
	authHeader := request.HeaderParameter("Authorization")
	tokenHeader := request.HeaderParameter("kdToken")

	return &LoginStatus{
		TokenPresent:  len(tokenHeader) > 0,
		HeaderPresent: len(authHeader) > 0,
		HTTPSMode: request.Request.TLS != nil,
	}
}
