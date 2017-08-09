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
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
)

// Credits to David W. https://stackoverflow.com/a/44688503

func ExportRSAKeyOrDie(privKey *rsa.PrivateKey) (priv, pub string) {
	privkey_bytes := x509.MarshalPKCS1PrivateKey(privKey)
	privkey_pem := pem.EncodeToMemory(
		&pem.Block{
			Type:  "RSA PRIVATE KEY",
			Bytes: privkey_bytes,
		},
	)

	priv = string(privkey_pem)

	pubkey_bytes, err := x509.MarshalPKIXPublicKey(&privKey.PublicKey)
	if err != nil {
		panic(err)
	}

	pubkey_pem := pem.EncodeToMemory(
		&pem.Block{
			Type:  "RSA PUBLIC KEY",
			Bytes: pubkey_bytes,
		},
	)

	pub = string(pubkey_pem)
	return
}

func ParseRSAKeyOrDie(privStr, pubStr string) *rsa.PrivateKey {
	block, _ := pem.Decode([]byte(privStr))
	if block == nil {
		panic("Failed to parse PEM block containing the key")
	}

	priv, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		panic(err)
	}

	block, _ = pem.Decode([]byte(pubStr))
	if block == nil {
		panic("Failed to parse PEM block containing the key")
	}

	pubInterface, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		panic(err)
	}

	pub, ok := pubInterface.(*rsa.PublicKey)
	if !ok {
		panic("Failed to parse public key")
	}

	priv.PublicKey = *pub
	return priv
}
