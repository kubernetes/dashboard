package sockjs

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"
	"time"
)

func TestHandler_Create(t *testing.T) {
	handler := newHandler("/echo", DefaultOptions, nil)
	if handler.Prefix() != "/echo" {
		t.Errorf("Prefix not properly set, got '%s' expected '%s'", handler.Prefix(), "/echo")
	}
	if handler.sessions == nil {
		t.Errorf("Handler session map not made")
	}
	server := httptest.NewServer(handler)
	defer server.Close()

	resp, err := http.Get(server.URL + "/echo")
	if err != nil {
		t.Errorf("There should not be any error, got '%s'", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Unexpected status code receiver, got '%d' expected '%d'", resp.StatusCode, http.StatusOK)
	}
}

func TestHandler_ParseSessionId(t *testing.T) {
	h := handler{prefix: "/prefix"}
	url, _ := url.Parse("http://server:80/prefix/server/session/whatever")
	if session, err := h.parseSessionID(url); session != "session" || err != nil {
		t.Errorf("Wrong session parsed, got '%s' expected '%s' with error = '%v'", session, "session", err)
	}
	url, _ = url.Parse("http://server:80/asdasd/server/session/whatever")
	if _, err := h.parseSessionID(url); err == nil {
		t.Errorf("Should return error")
	}
}

func TestHandler_SessionByRequest(t *testing.T) {
	h := newHandler("", DefaultOptions, nil)
	h.options.DisconnectDelay = 10 * time.Millisecond
	var handlerFuncCalled = make(chan Session)
	h.handlerFunc = func(conn Session) { handlerFuncCalled <- conn }
	req, _ := http.NewRequest("POST", "/server/sessionid/whatever/follows", nil)
	sess, err := h.sessionByRequest(req)
	if sess == nil || err != nil {
		t.Errorf("Session should be returned")
		// test handlerFunc was called
		select {
		case conn := <-handlerFuncCalled: // ok
			if conn != sess {
				t.Errorf("Handler was not passed correct session")
			}
		case <-time.After(100 * time.Millisecond):
			t.Errorf("HandlerFunc was not called")
		}
	}
	// test session is reused for multiple requests with same sessionID
	req2, _ := http.NewRequest("POST", "/server/sessionid/whatever", nil)
	if sess2, err := h.sessionByRequest(req2); sess2 != sess || err != nil {
		t.Errorf("Expected error, got session: '%v'", sess)
	}
	// test session expires after timeout
	time.Sleep(15 * time.Millisecond)
	h.sessionsMux.Lock()
	if _, exists := h.sessions["sessionid"]; exists {
		t.Errorf("Session should not exist in handler after timeout")
	}
	h.sessionsMux.Unlock()
	// test proper behaviour in case URL is not correct
	req, _ = http.NewRequest("POST", "", nil)
	if _, err := h.sessionByRequest(req); err == nil {
		t.Errorf("Expected parser sessionID from URL error, got 'nil'")
	}
}
