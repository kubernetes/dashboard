package login

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/net/xsrftoken"

	"k8s.io/dashboard/auth/pkg/router"
	"k8s.io/dashboard/csrf"
)

func init() {
	router.V1().GET("/csrftoken/:action", handleLogin)
}

func handleLogin(c *gin.Context) {
	action := c.Param("action")
	token := xsrftoken.Generate(csrf.Key(), "none", action)
	c.JSON(http.StatusOK, csrf.Response{Token: token})
}
