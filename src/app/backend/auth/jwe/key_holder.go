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

package jwe

import (
	"crypto/rand"
	"crypto/rsa"
	"log"
	"sync"

	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	syncApi "github.com/kubernetes/dashboard/src/app/backend/sync/api"
	"gopkg.in/square/go-jose.v2"
	k8sErrors "k8s.io/apimachinery/pkg/api/errors"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/pkg/api/v1"
)

type KeyHolder interface {
	Encrypter() jose.Encrypter
	Key() *rsa.PrivateKey
	Update() error
	Rotate() error
}

type rsaKeyHolder struct {
	encrypter jose.Encrypter
	// 256-byte random RSA key pair. Synced with a key saved in a secret.
	key          *rsa.PrivateKey
	synchronizer syncApi.Synchronizer
	mux          sync.Mutex
}

func (self *rsaKeyHolder) Encrypter() jose.Encrypter {
	self.mux.Lock()
	defer self.mux.Unlock()
	return self.encrypter
}

func (self *rsaKeyHolder) Update() error {
	panic("implement me")
}

func (self *rsaKeyHolder) Rotate() error {
	panic("implement me")
}

func (self *rsaKeyHolder) update(obj runtime.Object) {
	secret := obj.(*v1.Secret)
	log.Printf("Updating JWE encryption key from secret: %s", secret.Name)
	self.mux.Lock()
	defer self.mux.Unlock()

	priv, err := ParseRsaPrivateKey(string(secret.Data["priv"]))
	if err != nil {
		panic(err)
	}

	pub, err := ParseRsaPublicKey(string(secret.Data["pub"]))
	if err != nil {
		panic(err)
	}

	self.key = priv
	self.key.PublicKey = *pub
}

func (self *rsaKeyHolder) Key() *rsa.PrivateKey {
	self.mux.Lock()
	defer self.mux.Unlock()
	return self.key
}

func (self *rsaKeyHolder) init() {
	// Register event handlers
	self.synchronizer.RegisterActionHandler(self.update, watch.Added, watch.Modified)

	// Try to init key from synchronized object
	if obj := self.synchronizer.Get(); obj != nil {
		log.Print("Initializing JWE encryption key from synchronized object")
		self.update(obj)
		return
	}

	// If secret with key was not found generate new key
	self.initEncryptionKey()

	// Try to save generated key in a secret
	err := self.synchronizer.Create(self.getEncryptionKeyHolder())
	if err != nil && !k8sErrors.IsAlreadyExists(err) {
		panic(err)
	}
}

func (self *rsaKeyHolder) getEncryptionKeyHolder() runtime.Object {
	priv, pub := ExportRSAKeyOrDie(self.Key())
	return &v1.Secret{
		ObjectMeta: metaV1.ObjectMeta{
			Namespace: authApi.EncryptionKeyHolderNamespace,
			Name:      authApi.EncryptionKeyHolderName,
		},

		StringData: map[string]string{
			"priv": priv,
			"pub":  pub,
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

func NewRSAKeyHolder(synchronizer syncApi.Synchronizer) KeyHolder {
	holder := &rsaKeyHolder{
		synchronizer: synchronizer,
	}

	holder.init()
	return holder
}
