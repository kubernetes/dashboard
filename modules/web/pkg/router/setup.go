package router

import (
	"github.com/gin-gonic/gin"
	"k8s.io/dashboard/web/pkg/environment"
)

var (
	router *gin.Engine
	root   *gin.RouterGroup
)

func init() {
	if !environment.IsDev() {
		gin.SetMode(gin.ReleaseMode)
	}

	router = gin.Default()
	_ = router.SetTrustedProxies(nil)
	root = router.Group("/")
}

func Root() *gin.RouterGroup {
	return root
}

func Router() *gin.Engine {
	return router
}
