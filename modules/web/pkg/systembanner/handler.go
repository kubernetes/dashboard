package login

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"k8s.io/dashboard/web/pkg/args"
	"k8s.io/dashboard/web/pkg/router"
)

// SystemBanner represents system banner.
type SystemBanner struct {
	Message  string               `json:"message"`
	Severity SystemBannerSeverity `json:"severity"`
}

// SystemBannerSeverity represents the severity of system banner.
type SystemBannerSeverity string

const (
	// SystemBannerSeverityInfo is the lowest of allowed system banner severities.
	SystemBannerSeverityInfo SystemBannerSeverity = "INFO"

	// SystemBannerSeverityWarning is in the middle of allowed system banner severities.
	SystemBannerSeverityWarning SystemBannerSeverity = "WARNING"

	// SystemBannerSeverityError is the highest of allowed system banner severities.
	SystemBannerSeverityError SystemBannerSeverity = "ERROR"
)

func init() {
	router.Root().GET("/systembanner", handleGetSystemBanner)
}

func handleGetSystemBanner(c *gin.Context) {
	systemBanner := SystemBanner{
		Message:  args.SystemBanner(),
		Severity: getSeverity(args.SystemBannerSeverity()),
	}

	c.JSON(http.StatusOK, systemBanner)
}

// getSeverity returns one of the allowed severity values based on given parameter.
func getSeverity(severity string) SystemBannerSeverity {
	switch severity {
	case string(SystemBannerSeverityWarning):
		return SystemBannerSeverityWarning
	case string(SystemBannerSeverityError):
		return SystemBannerSeverityError
	default:
		return SystemBannerSeverityInfo
	}
}
