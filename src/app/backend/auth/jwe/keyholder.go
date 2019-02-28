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

package jwe

import (
	"crypto/rand"
	"crypto/rsa"
	"log"
	"sync"

	jose "gopkg.in/square/go-jose.v2"
	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/watch"

	"github.com/kubernetes/dashboard/src/app/backend/args"
	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	syncApi "github.com/kubernetes/dashboard/src/app/backend/sync/api"
)

// Entries held by resource used to synchronize encryption key data.
const (
	holderMapKeyEntry  = "priv"
	holderMapCertEntry = "pub"
)

// KeyHolder is responsible for generating, storing and synchronizing encryption key used for token
// generation/decryption.
type KeyHolder interface {
	// Returns encrypter instance that can be used to encrypt data.
	Encrypter() jose.Encrypter
	// Returns encryption key that can be used to decrypt data.
	Key() *rsa.PrivateKey
	// Forces refresh of encryption key synchronized with kubernetes resource (secret).
	Refresh()
}

// Implements KeyHolder interface
type rsaKeyHolder struct {
	// 256-byte random RSA key pair. Synced with a key saved in a secret.
	key          *rsa.PrivateKey
	synchronizer syncApi.Synchronizer
	mux          sync.Mutex
}

// Encrypter implements key holder interface. See KeyHolder for more information.
// Used encryption algorithms:
//    - Content encryption: AES-GCM (256)
//    - Key management: RSA-OAEP-SHA256
func (self *rsaKeyHolder) Encrypter() jose.Encrypter {
	publicKey := &self.Key().PublicKey
	encrypter, err := jose.NewEncrypter(jose.A256GCM, jose.Recipient{Algorithm: jose.RSA_OAEP_256, Key: publicKey}, nil)
	if err != nil {
		panic(err)
	}

	return encrypter
}

// Key implements key holder interface. See KeyHolder for more information.
func (self *rsaKeyHolder) Key() *rsa.PrivateKey {
	self.mux.Lock()
	defer self.mux.Unlock()
	return self.key
}

// Refresh implements key holder interface. See KeyHolder for more information.
func (self *rsaKeyHolder) Refresh() {
	self.synchronizer.Refresh()
	self.update(self.synchronizer.Get())
}

// Handler function executed by synchronizer used to store encryption key. It is called whenever watched object
// is created or updated.
func (self *rsaKeyHolder) update(obj runtime.Object) {
	secret := obj.(*v1.Secret)
	priv, err := ParseRSAKey(string(secret.Data[holderMapKeyEntry]), string(secret.Data[holderMapCertEntry]))
	if err != nil {
		// Secret was probably tampered with. Update it based on local key.
		err := self.synchronizer.Update(self.getEncryptionKeyHolder())
		if err != nil {
			panic(err)
		}

		return
	}

	self.mux.Lock()
	defer self.mux.Unlock()
	self.key = priv
}

// Handler function executed by synchronizer used to store encryption key. It is called whenever watched object
// gets deleted. It is then recreated based on local key.
func (self *rsaKeyHolder) recreate(obj runtime.Object) {
	secret := obj.(*v1.Secret)
	log.Printf("Synchronized secret %s has been deleted. Recreating.", secret.Name)
	if err := self.synchronizer.Create(self.getEncryptionKeyHolder()); err != nil {
		panic(err)
	}
}

func (self *rsaKeyHolder) init() {
	self.initEncryptionKey()

	// Register event handlers
	self.synchronizer.RegisterActionHandler(self.update, watch.Added, watch.Modified)
	self.synchronizer.RegisterActionHandler(self.recreate, watch.Deleted)

	// Try to init key from synchronized object
	if obj := self.synchronizer.Get(); obj != nil {
		log.Print("Initializing JWE encryption key from synchronized object")
		self.update(obj)
		return
	}

	// Try to save generated key in a secret
	log.Printf("Storing encryption key in a secret")
	err := self.synchronizer.Create(self.getEncryptionKeyHolder())
	if err != nil && !errors.IsAlreadyExists(err) {
		panic(err)
	}
}

func (self *rsaKeyHolder) getEncryptionKeyHolder() runtime.Object {
	priv, pub := ExportRSAKeyOrDie(self.Key())
	return &v1.Secret{
		ObjectMeta: metaV1.ObjectMeta{
			Namespace: args.Holder.GetNamespace(),
			Name:      authApi.EncryptionKeyHolderName,
		},

		Data: map[string][]byte{
			holderMapKeyEntry:  []byte(priv),
			holderMapCertEntry: []byte(pub),
		},
	}
}

// Generates encryption key used to encrypt token payload.
func (self *rsaKeyHolder) initEncryptionKey() {
	log.Print("Generating JWE encryption key")
	self.mux.Lock()
	defer self.mux.Unlock()

	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		panic(err)
	}

	self.key = privateKey
}

// NewRSAKeyHolder creates new KeyHolder instance.
func NewRSAKeyHolder(synchronizer syncApi.Synchronizer) KeyHolder {
	holder := &rsaKeyHolder{
		synchronizer: synchronizer,
	}

	holder.init()
	return holder
}
