package poll_test

import (
	"testing"
	"github.com/kubernetes/dashboard/src/app/backend/sync/poll"
)

func TestNewPollWatcher(t *testing.T) {
	watcher := poll.NewPollWatcher()

	if watcher == nil {
		t.Fatal("Expected watcher not to be nil.")
	}
}

