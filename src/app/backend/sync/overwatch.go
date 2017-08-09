// Copyright 2017 The Kubernetes Dashboard Authors.
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
	"log"
	"sync"

	syncApi "github.com/kubernetes/dashboard/src/app/backend/sync/api"
	"k8s.io/apimachinery/pkg/util/wait"
)

var DefaultOverwatch *Overwatch

func init() {
	DefaultOverwatch = &Overwatch{
		syncMap:   make(map[string]syncApi.Synchronizer),
		policyMap: make(map[string]RestartPolicy),

		registrationSignal: make(chan string),
		restartSignal:      make(chan string),
	}

	DefaultOverwatch.Run()
}

type RestartPolicy string

const (
	AlwaysRestart RestartPolicy = "always"
	NeverRestart  RestartPolicy = "never"
)

type Overwatch struct {
	syncMap   map[string]syncApi.Synchronizer
	policyMap map[string]RestartPolicy

	registrationSignal chan string
	restartSignal      chan string

	mux sync.Mutex
}

func (self *Overwatch) Run() {
	self.monitorRegistrationEvents()
	self.monitorRestartEvents()
}

func (self *Overwatch) monitorRestartEvents() {
	go wait.Forever(func() {
		select {
		case name := <-self.restartSignal:
			log.Printf("Restarting synchronizer: %s.", name)
			synchronizer := self.syncMap[name]
			synchronizer.Start()
			self.monitorSynchronizerStatus(synchronizer)
		}
	}, 0)
}

func (self *Overwatch) monitorRegistrationEvents() {
	go wait.Forever(func() {
		select {
		case name := <-self.registrationSignal:
			synchronizer := self.syncMap[name]
			log.Printf("New synchronizer has been registered: %s. Starting.", name)
			synchronizer.Start()
			self.monitorSynchronizerStatus(synchronizer)
		}
	}, 0)
}

func (self *Overwatch) monitorSynchronizerStatus(synchronizer syncApi.Synchronizer) {
	stopCh := make(chan struct{})
	name := synchronizer.Name()
	go wait.Until(func() {
		select {
		case err := <-synchronizer.Error():
			log.Printf("Synchronizer %s exited with error: %s", name, err.Error())
			if self.policyMap[name] == AlwaysRestart {
				self.broadcastRestartEvent(name)
				close(stopCh)
			}
		}
	}, 0, stopCh)
}

func (self *Overwatch) broadcastRegistrationEvent(name string) {
	self.registrationSignal <- name
}

func (self *Overwatch) broadcastRestartEvent(name string) {
	self.restartSignal <- name
}

func (self *Overwatch) RegisterSynchronizer(synchronizer syncApi.Synchronizer, policy RestartPolicy) {
	if _, exists := self.syncMap[synchronizer.Name()]; exists {
		log.Printf("Synchronizer %s is already registered. Skipping", synchronizer.Name())
		return
	}

	self.syncMap[synchronizer.Name()] = synchronizer
	self.policyMap[synchronizer.Name()] = policy
	self.broadcastRegistrationEvent(synchronizer.Name())
}
