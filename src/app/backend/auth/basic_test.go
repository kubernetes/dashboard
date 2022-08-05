package auth

import (
	authAPI "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	"testing"
)

func TestNewBasicAuthenticator(t *testing.T) {
	auth := NewBasicAuthenticator(&authAPI.LoginSpec{
		Username:   "username",
		Password:   "password",
		Token:      "",
		KubeConfig: "",
	})

	if _, err := auth.GetAuthInfo(); err != nil {
		t.Errorf("Failed: %v", err)
	}
}
