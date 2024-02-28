package router

import (
	"github.com/gin-gonic/gin"

	"k8s.io/dashboard/auth/pkg/environment"
	"k8s.io/dashboard/csrf"
	"k8s.io/dashboard/helpers"
)

var (
	router *gin.Engine
	v1     *gin.RouterGroup
)

func init() {
	if !environment.IsDev() {
		gin.SetMode(gin.ReleaseMode)
	}

	router = gin.Default()
	_ = router.SetTrustedProxies(nil)
	v1 = router.Group("/api/v1")
	v1.Use(csrf.Gin().CSRF(
		csrf.Gin().WithCSRFActionGetter(helpers.GetResourceFromPath)),
	)
}

func V1() *gin.RouterGroup {
	return v1
}

func Router() *gin.Engine {
	return router
}
