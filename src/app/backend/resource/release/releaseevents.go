// Copyright 2015 Google Inc. All Rights Reserved.
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

package release

import (
	"log"

	"k8s.io/kubernetes/pkg/api"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
)

// GetReleaseEvents returns model events for a release with the given name in the given
// namespace
func GetReleaseEvents(dpEvents []api.Event, namespace string, releaseName string) (
	*common.EventList, error) {

	log.Printf("Getting events related to %s release in %s namespace", releaseName,
		namespace)

	if !event.IsTypeFilled(dpEvents) {
		dpEvents = event.FillEventsType(dpEvents)
	}

	// TODO support pagination
	events := event.CreateEventList(dpEvents, dataselect.NoDataSelect)

	log.Printf("Found %d events related to %s release in %s namespace",
		len(events.Events), releaseName, namespace)

	return &events, nil
}
