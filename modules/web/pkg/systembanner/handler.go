package systembanner

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"k8s.io/dashboard/web/pkg/args"
	"k8s.io/dashboard/web/pkg/router"
)

func init() {
	router.Root().GET("/systembanner", handleGetSystemBanner)
}

func handleGetSystemBanner(c *gin.Context) {
	c.JSON(http.StatusOK, SystemBanner{
		Message:  args.SystemBanner(),
		Severity: toSystemBannerSeverity(args.SystemBannerSeverity()),
	})
}
