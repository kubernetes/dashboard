package sync

import (
	"testing"

	"k8s.io/client-go/kubernetes/fake"
)

func TestNewSynchronizerManager(t *testing.T) {
	manager := NewSynchronizerManager(fake.NewSimpleClientset())
	if manager == nil {
		t.Fatalf("NewSynchronizerManager(): Expected synchronizer manager not to be nil")
	}
}

func TestSynchronizerManager_Secret(t *testing.T) {
	manager := NewSynchronizerManager(fake.NewSimpleClientset())
	if manager.Secret("", "") == nil {
		t.Fatalf("Secret(%s, %s): Expected secret synchronizer not to be nil", "", "")
	}
}
