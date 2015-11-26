// Copyright 2015 Google Inc. All Rights Reserved.
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

package main

import (
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"testing"
)

var fakeRemoteClient = new(client.Client)
var fakeInClusterClient = new(client.Client)

type FakeClientFactory struct{}

func (FakeClientFactory) New(cfg *client.Config) (*client.Client, error) {
	return fakeRemoteClient, nil
}

func (FakeClientFactory) NewInCluster() (*client.Client, error) {
	return fakeInClusterClient, nil
}

func TestCreateApiserverClient_inCluster(t *testing.T) {
	client, _ := CreateApiserverClient("", new(FakeClientFactory))
	if client != fakeInClusterClient {
		t.Fatal("Expected in cluster client to be created")
	}
}

func TestCreateApiserverClient_remote(t *testing.T) {
	client, _ := CreateApiserverClient("http://foo:bar", new(FakeClientFactory))
	if client != fakeRemoteClient {
		t.Fatal("Expected remote client to be created")
	}
}
