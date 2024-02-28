package login

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"k8s.io/klog/v2"

	v1 "k8s.io/dashboard/auth/api/v1"
	"k8s.io/dashboard/auth/pkg/router"
)

func init() {
	router.V1().POST("/login", handleLogin)
	router.V1().GET("/login/status", handleLoginStatus)
}

func handleLogin(c *gin.Context) {
	loginRequest := new(v1.LoginRequest)
	err := c.Bind(loginRequest)
	if err != nil {
		klog.ErrorS(err, "Could not read login request")
		c.JSON(http.StatusBadRequest, err)
		return
	}

	response, code, err := login(loginRequest, c.Request)
	if err != nil {
		klog.ErrorS(err, "Could not log in")
		c.JSON(code, err)
		return
	}

	c.JSON(code, response)
}

func handleLoginStatus(c *gin.Context) {
	c.JSON(http.StatusOK, "OK")
}
