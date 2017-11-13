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
