package login

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/auth/pkg/router"
)

func init() {
	router.V1().POST("/login", handleLogin)
	router.V1().GET("/login/status", handleLoginStatus)
}

func handleLogin(c *gin.Context) {
	userInfo, code, err := login(c)
	if err != nil {
		klog.ErrorS(err, "Could not log in")
		c.JSON(code, err)
		return
	}

	c.JSON(code, userInfo)
}

func handleLoginStatus(c *gin.Context) {
	c.JSON(http.StatusOK, "OK")
}
