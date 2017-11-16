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

package poll

import (
	"sync"

	"k8s.io/apimachinery/pkg/watch"
)

// Implements watch.Interface
type PollWatcher struct {
	eventChan chan watch.Event
	stopped   bool
	sync.Mutex
}

// Stop stops poll watcher and closes event channel.
func (self *PollWatcher) Stop() {
	self.Lock()
	defer self.Unlock()
	if !self.stopped {
		close(self.eventChan)
		self.stopped = true
	}
}

// IsStopped returns whether or not watcher was stopped.
func (self *PollWatcher) IsStopped() bool {
	return self.stopped
}

// ResultChan returns result channel that user can watch for incoming events.
func (self *PollWatcher) ResultChan() <-chan watch.Event {
	self.Lock()
	defer self.Unlock()
	return self.eventChan
}

// NewPollWatcher creates instance of PollWatcher.
func NewPollWatcher() *PollWatcher {
	return &PollWatcher{
		eventChan: make(chan watch.Event),
		stopped:   false,
	}
}
