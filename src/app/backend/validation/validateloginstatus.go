package validation

import "github.com/emicklei/go-restful"

// LoginStatus TODO
type LoginStatus struct {
	// True when headers indicating logged in user are found in request.
	LoggedIn bool `json:"loggedIn"`
}

// ValidateLoginStatus TODO
func ValidateLoginStatus(request *restful.Request) *LoginStatus {
	authHeader := request.HeaderParameter("Authorization")
	tokenHeader := request.HeaderParameter("kdToken")
	if  authHeader == "" && tokenHeader == "" {
		return &LoginStatus{false}
	}

	return &LoginStatus{true}
}
