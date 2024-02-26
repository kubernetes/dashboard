package v1

type LoginRequest struct {
	Token string `json:"token"`
}

type LoginResponse struct {
	Token string `json:"token"`
}
