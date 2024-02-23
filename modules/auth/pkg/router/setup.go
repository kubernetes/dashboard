package router

import (
	"github.com/gin-gonic/gin"

	"k8s.io/dashboard/auth/pkg/environment"
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
}

func V1() *gin.RouterGroup {
	return v1
}

func Router() *gin.Engine {
	return router
}
