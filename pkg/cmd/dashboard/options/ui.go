package options

import (
  cliflag "k8s.io/component-base/cli/flag"
)

type UIRunOptions struct {
  EnableInsecureLogin bool
  EnableSkipLogin bool
  EnableSettingsAuthorizer bool

  SystemBanner string
  SystemBannerSeverity string
}

func (s *UIRunOptions) Flags() (fss cliflag.NamedFlagSets) {
  fs := fss.FlagSet("ui")
  fs.BoolVar(&s.EnableInsecureLogin, "enable-insecure-login", s.EnableInsecureLogin, "When enabled, Dashboard login view will also be shown when Dashboard is not served over HTTPS.")
  fs.BoolVar(&s.EnableSkipLogin, "enable-skip-login", s.EnableSkipLogin, "When enabled, the skip button on the login page will be shown.")
  fs.BoolVar(&s.EnableSettingsAuthorizer, "enable-settings-authorizer", s.EnableSettingsAuthorizer, "When enabled, Dashboard settings page will not require user to be logged in and authorized to access settings page.")

  fs.StringVar(&s.SystemBanner, "system-banner", s.SystemBanner, "When non-empty displays message to Dashboard users. Accepts simple HTML tags.")
  fs.StringVar(&s.SystemBannerSeverity, "system-banner-severity", s.SystemBannerSeverity, "Severity of system banner. Should be one of 'INFO|WARNING|ERROR'.")

  return fss
}

func NewUIRunOptions() *UIRunOptions {
  return &UIRunOptions{
    EnableInsecureLogin:      false,
    EnableSkipLogin:          false,
    EnableSettingsAuthorizer: true,
    SystemBannerSeverity:     "INFO",
  }
}
