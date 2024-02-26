package login

import (
	"net/http"

	v1 "k8s.io/dashboard/auth/api/v1"
	"k8s.io/dashboard/client"
	"k8s.io/dashboard/errors"
)

func login(spec *v1.LoginRequest, request *http.Request) (*v1.LoginResponse, int, error) {
	ensureAuthorizationHeader(spec, request)

	k8sClient, err := client.Client(request)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}

	if _, err = k8sClient.Discovery().ServerVersion(); err != nil {
		code, err := errors.HandleError(err)
		return nil, code, err
	}

	return &v1.LoginResponse{Token: spec.Token}, http.StatusOK, nil
}

func ensureAuthorizationHeader(spec *v1.LoginRequest, request *http.Request) {
	client.SetAuthorizationHeader(request, spec.Token)
}
