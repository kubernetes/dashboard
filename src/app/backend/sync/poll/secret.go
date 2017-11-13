package poll

import (
	"time"

	syncapi "github.com/kubernetes/dashboard/src/app/backend/sync/api"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/wait"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/kubernetes"
)

// SecretPoller implements Poller interface. See Poller for more information.
type SecretPoller struct {
	name      string
	namespace string
	client    kubernetes.Interface
	watcher   *PollWatcher
}

// Poll new secret every 'interval' time and send it to watcher channel. See Poller for more information.
func (self *SecretPoller) Poll(interval time.Duration) watch.Interface {
	stopCh := make(chan struct{})

	go wait.Until(func() {
		if self.watcher.IsStopped() {
			close(stopCh)
			return
		}

		self.watcher.eventChan <- self.getSecretEvent()
	}, interval, stopCh)

	return self.watcher
}

// Gets secret from API server and transforms it to watch.Event object.
func (self *SecretPoller) getSecretEvent() watch.Event {
	secret, err := self.client.CoreV1().Secrets(self.namespace).Get(self.name, v1.GetOptions{})
	event := watch.Event{
		Object: secret,
		Type:   watch.Added,
	}

	if err != nil {
		event.Type = watch.Error
	}

	if self.isNotFoundError(err) {
		event.Type = watch.Deleted
	}

	return event
}

// Checks whether or not given error is a not found error (404).
func (self *SecretPoller) isNotFoundError(err error) bool {
	statusErr, ok := err.(*errors.StatusError)
	if !ok {
		return false
	}
	return statusErr.ErrStatus.Code == 404
}

// NewSecretPoller returns instance of Poller interface.
func NewSecretPoller(name, namespace string, client kubernetes.Interface) syncapi.Poller {
	return &SecretPoller{
		name:      name,
		namespace: namespace,
		client:    client,
		watcher:   NewPollWatcher(),
	}
}
