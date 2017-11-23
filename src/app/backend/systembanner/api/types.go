// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package api

// SystemBannerManager is used for user system banner management.
type SystemBannerManager interface {
	// Get system banner.
	Get() *SystemBanner
}

// SystemBanner represents system banner.
type SystemBanner struct {
	Message  string               `json:"message"`
	Severity SystemBannerSeverity `json:"severity"`
}

// SystemBannerSeverity represents severity of system banner.
type SystemBannerSeverity string

const (
	// SystemBannerSeverityInfo is the lowest of allowed system banner severities.
	SystemBannerSeverityInfo SystemBannerSeverity = "INFO"

	// SystemBannerSeverityInfo is in the middle of allowed system banner severities.
	SystemBannerSeverityWarning SystemBannerSeverity = "WARNING"

	// SystemBannerSeverityInfo is the highest of allowed system banner severities.
	SystemBannerSeverityError SystemBannerSeverity = "ERROR"
)

// GetSeverity returns one of allowed severity values based on given parameter.
func GetSeverity(severity string) SystemBannerSeverity {
	switch severity {
	case string(SystemBannerSeverityWarning):
		return SystemBannerSeverityWarning
	case string(SystemBannerSeverityError):
		return SystemBannerSeverityError
	default:
		return SystemBannerSeverityInfo
	}
}
