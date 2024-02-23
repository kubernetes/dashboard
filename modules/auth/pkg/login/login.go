package login

import (
	"net/http"

	"github.com/gin-gonic/gin"

	v1 "k8s.io/dashboard/auth/api/v1"
	"k8s.io/dashboard/auth/pkg/kubernetes"
	"k8s.io/dashboard/errors"
)

func login(c *gin.Context) (*v1.UserInfo, int, error) {
	k8sClient, err := kubernetes.Client(c)
	if err != nil {
		code, err := errors.HandleError(err)
		return nil, code, err
	}

	if _, err = k8sClient.Discovery().ServerVersion(); err != nil {
		code, err := errors.HandleError(err)
		return nil, code, err
	}

	// TODO: Extract user info
	return &v1.UserInfo{}, http.StatusOK, nil
}
