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

package sync

import (
	"fmt"
	"log"
	"time"

	"k8s.io/apimachinery/pkg/util/wait"

	syncApi "github.com/kubernetes/dashboard/src/app/backend/sync/api"
)

// Overwatch is watching over every registered synchronizer. In case of error it will be logged and if RestartPolicy
// is set to "Always" synchronizer will be restarted.
var Overwatch *overwatch

// Initializes and starts Overwatch instance. It is private to make sure that only one instance is running.
func init() {
	Overwatch = &overwatch{
		syncMap:      make(map[string]syncApi.Synchronizer),
		policyMap:    make(map[string]RestartPolicy),
		restartCount: make(map[string]int),

		registrationSignal: make(chan string),
		restartSignal:      make(chan string),
	}

	log.Print("Starting overwatch")
	Overwatch.Run()
}

// RestartPolicy is used by Overwatch to determine how to behave in case of synchronizer error.
type RestartPolicy string

const (
	// In case of synchronizer error it will be restarted.
	AlwaysRestart RestartPolicy = "always"
	NeverRestart  RestartPolicy = "never"

	RestartDelay = 2 * time.Second
	// We don't need to sync it with every instance. If a single instance synchronizer fails
	// often, just force restart it.
	MaxRestartCount = 15
)

type overwatch struct {
	syncMap      map[string]syncApi.Synchronizer
	policyMap    map[string]RestartPolicy
	restartCount map[string]int

	registrationSignal chan string
	restartSignal      chan string
}

// RegisterSynchronizer registers given synchronizer with given restart policy.
func (self *overwatch) RegisterSynchronizer(synchronizer syncApi.Synchronizer, policy RestartPolicy) {
	if _, exists := self.syncMap[synchronizer.Name()]; exists {
		log.Printf("Synchronizer %s is already registered. Skipping", synchronizer.Name())
		return
	}

	self.syncMap[synchronizer.Name()] = synchronizer
	self.policyMap[synchronizer.Name()] = policy
	self.broadcastRegistrationEvent(synchronizer.Name())
}

// Run starts overwatch.
func (self *overwatch) Run() {
	self.monitorRegistrationEvents()
	self.monitorRestartEvents()
}

func (self *overwatch) monitorRestartEvents() {
	go wait.Forever(func() {
		select {
		case name := <-self.restartSignal:
			if self.restartCount[name] > MaxRestartCount {
				panic(fmt.Sprintf("synchronizer %s restart limit execeeded. Restarting pod.", name))
			}

			log.Printf("Restarting synchronizer: %s.", name)
			synchronizer := self.syncMap[name]
			synchronizer.Start()
			self.monitorSynchronizerStatus(synchronizer)
		}
	}, 0)
}

func (self *overwatch) monitorRegistrationEvents() {
	go wait.Forever(func() {
		select {
		case name := <-self.registrationSignal:
			synchronizer := self.syncMap[name]
			log.Printf("New synchronizer has been registered: %s. Starting", name)
			self.monitorSynchronizerStatus(synchronizer)
			synchronizer.Start()
		}
	}, 0)
}

func (self *overwatch) monitorSynchronizerStatus(synchronizer syncApi.Synchronizer) {
	stopCh := make(chan struct{})
	name := synchronizer.Name()
	go wait.Until(func() {
		select {
		case err := <-synchronizer.Error():
			log.Printf("Synchronizer %s exited with error: %s", name, err.Error())
			if self.policyMap[name] == AlwaysRestart {
				// Wait a sec before restarting synchronizer in case it exited with error.
				time.Sleep(RestartDelay)
				self.broadcastRestartEvent(name)
				self.restartCount[name]++
			}

			close(stopCh)
		}
	}, 0, stopCh)
}

func (self *overwatch) broadcastRegistrationEvent(name string) {
	self.registrationSignal <- name
}

func (self *overwatch) broadcastRestartEvent(name string) {
	self.restartSignal <- name
}
