package csrf

// Response is used to secure requests from CSRF attacks
type Response struct {
	// Token generated on request for validation
	Token string `json:"token"`
}
