package jwe

import (
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/sync"
	"k8s.io/client-go/kubernetes/fake"
)

func getKeyHolder() KeyHolder {
	c := fake.NewSimpleClientset()
	syncManager := sync.NewSynchronizerManager(c)
	return NewRSAKeyHolder(syncManager.Secret("", ""))
}

func TestNewRSAKeyHolder(t *testing.T) {
	holder := getKeyHolder()
	if holder == nil {
		t.Fatalf("NewRSAKeyHolder(): Expected key holder not to be nil")
	}
}

func TestRsaKeyHolder_Encrypter(t *testing.T) {
	holder := getKeyHolder()
	if holder.Encrypter() == nil {
		t.Fatalf("Encrypter(): Expected encrypter not to be nil")
	}
}

func TestRsaKeyHolder_Key(t *testing.T) {
	holder := getKeyHolder()
	if holder.Key() == nil {
		t.Fatalf("Key(): Expected key not to be nil")
	}
}

