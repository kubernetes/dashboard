package common

import (
	"testing"
)

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
		t.Errorf("Expected foo to match")
	}
	if nsQ.Matches("foo-bar") {
		t.Errorf("Expected foo-bar not to match")
	}

	nsQ = NewNamespaceQuery(nil)
	if !nsQ.Matches("foo") {
		t.Errorf("Expected foo to match")
	}
	if nsQ.Matches("kube-system") {
		t.Errorf("Expected kube-system not to match")
	}

	nsQ = NewNamespaceQuery([]string{"foo", "bar"})
	if !nsQ.Matches("foo") {
		t.Errorf("Expected foo to match")
	}
	if !nsQ.Matches("bar") {
		t.Errorf("Expected bar to match")
	}
	if nsQ.Matches("baz") {
		t.Errorf("Expected baz not to match")
	}
	if nsQ.Matches("kube-system") {
		t.Errorf("Expected kube-system not to match")
	}
}
