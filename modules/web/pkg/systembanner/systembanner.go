package systembanner

type SystemBanner struct {
	Message  string               `json:"message"`
	Severity SystemBannerSeverity `json:"severity"`
}

type SystemBannerSeverity string

const (
	SystemBannerSeverityInfo    SystemBannerSeverity = "INFO"
	SystemBannerSeverityWarning SystemBannerSeverity = "WARNING"
	SystemBannerSeverityError   SystemBannerSeverity = "ERROR"
)

func toSystemBannerSeverity(severity string) SystemBannerSeverity {
	switch severity {
	case string(SystemBannerSeverityWarning):
		return SystemBannerSeverityWarning
	case string(SystemBannerSeverityError):
		return SystemBannerSeverityError
	default:
		return SystemBannerSeverityInfo
	}
}
