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

package main

import (
	"log"
	"time"
)

// ServerTime is a representation of server time.
type ServerTime struct {
	// CurrentTime is current server time.
	CurrentTime time.Time `json:"currentTime"`
}

// GetServerTime returns current Kubernetes Dashboard server time. It should be taken from
// Kubernetes API, but there isn't any at the moment.
func GetServerTime() *ServerTime {
	log.Printf("Getting current server time")

	time := &ServerTime{
		CurrentTime: time.Now(),
	}

	log.Printf("Current server time is %s",
		time.CurrentTime.Format("2006-01-02T15:04:05.999999-07:00"))

	return time
}
