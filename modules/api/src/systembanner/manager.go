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

package systembanner

import (
	"github.com/kubernetes/dashboard/src/app/backend/systembanner/api"
)

// SystemBannerManager is a structure containing all system banner manager members.
type SystemBannerManager struct {
	systemBanner api.SystemBanner
}

// NewSystemBannerManager creates new settings manager.
func NewSystemBannerManager(message, severity string) SystemBannerManager {
	return SystemBannerManager{
		systemBanner: api.SystemBanner{
			Message:  message,
			Severity: api.GetSeverity(severity),
		},
	}
}

// Get implements SystemBannerManager interface. Check it for more information.
func (sbm *SystemBannerManager) Get() api.SystemBanner {
	return sbm.systemBanner
}
