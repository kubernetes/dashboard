package router

import (
	"github.com/gin-gonic/gin"
	"k8s.io/dashboard/web/pkg/environment"
)

var (
	router *gin.Engine
	root   *gin.RouterGroup
	v1     *gin.RouterGroup
)

func init() {
	if !environment.IsDev() {
		gin.SetMode(gin.ReleaseMode)
	}

	router = gin.Default()
	_ = router.SetTrustedProxies(nil)
	root = router.Group("/")
	v1 = router.Group("/api/v1")
}

func Root() *gin.RouterGroup {
	return root
}

func V1() *gin.RouterGroup {
	return v1
}

func Router() *gin.Engine {
	return router
}
