package poll_test

import (
	"testing"
	"time"

	"github.com/kubernetes/dashboard/src/app/backend/sync/poll"
	"k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/kubernetes/fake"
)

func TestNewSecretPoller(t *testing.T) {
	poller := poll.NewSecretPoller("test-secret", "test-ns", nil)

	if poller == nil {
		t.Fatal("Expected poller not to be nil.")
	}
}

func TestNewSecretPoller_Poll(t *testing.T) {
	var watchEvent *watch.Event
	sName := "test-secret"
	nsName := "test-ns"
	event := &v1.Event{
		ObjectMeta: metav1.ObjectMeta{
			Namespace: nsName,
			Name:      sName,
		},
	}
	client := fake.NewSimpleClientset(event)
	poller := poll.NewSecretPoller(sName, nsName, client)

	watcher := poller.Poll(1 * time.Second)
	select {
	case ev := <-watcher.ResultChan():
		watchEvent = &ev
	case <-time.After(3 * time.Second):
	}

	if watchEvent == nil {
		t.Fatal("Expected watchEvent not to be nil.")
	}
}
