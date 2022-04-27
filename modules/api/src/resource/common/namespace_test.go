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

package common

import "testing"

func TestToRequestParam(t *testing.T) {
	nsQ := NewSameNamespaceQuery("foo")
	if nsQ.ToRequestParam() != "foo" {
		t.Errorf("Expected %s to be foo", nsQ.ToRequestParam())
	}

	nsQ = NewNamespaceQuery([]string{"foo", "bar"})
	if nsQ.ToRequestParam() != "" {
		t.Errorf("Expected %s to be ''", nsQ.ToRequestParam())
	}

	nsQ = NewNamespaceQuery([]string{})
	if nsQ.ToRequestParam() != "" {
		t.Errorf("Expected %s to be ''", nsQ.ToRequestParam())
	}

	nsQ = NewNamespaceQuery(nil)
	if nsQ.ToRequestParam() != "" {
		t.Errorf("Expected %s to be ''", nsQ.ToRequestParam())
	}
}

func TestMatches(t *testing.T) {
	nsQ := NewSameNamespaceQuery("foo")
	if !nsQ.Matches("foo") {
		t.Error("Expected foo to match")
	}
	if nsQ.Matches("foo-bar") {
		t.Error("Expected foo-bar not to match")
	}

	nsQ = NewNamespaceQuery(nil)
	if !nsQ.Matches("foo") {
		t.Error("Expected foo to match")
	}
	if !nsQ.Matches("kube-system") {
		t.Error("Expected kube-system to match")
	}

	nsQ = NewNamespaceQuery([]string{"foo", "bar"})
	if !nsQ.Matches("foo") {
		t.Error("Expected foo to match")
	}
	if !nsQ.Matches("bar") {
		t.Error("Expected bar to match")
	}
	if nsQ.Matches("baz") {
		t.Error("Expected baz not to match")
	}
	if nsQ.Matches("kube-system") {
		t.Error("Expected kube-system not to match")
	}
}
