package sockjs

import "testing"

func TestCloseFrame(t *testing.T) {
	cf := closeFrame(1024, "some close text")
	if cf != "c[1024,\"some close text\"]" {
		t.Errorf("Wrong close frame generated '%s'", cf)
	}
}
