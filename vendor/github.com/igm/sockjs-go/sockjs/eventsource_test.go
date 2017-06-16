package sockjs

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestHandler_EventSource(t *testing.T) {
	rw := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/server/session/eventsource", nil)
	h := newTestHandler()
	h.options.ResponseLimit = 1024
	go func() {
		time.Sleep(1 * time.Millisecond)
		h.sessionsMux.Lock()
		defer h.sessionsMux.Unlock()
		sess := h.sessions["session"]
		sess.Lock()
		defer sess.Unlock()
		recv := sess.recv
		recv.close()
	}()
	h.eventSource(rw, req)
	contentType := rw.Header().Get("content-type")
	expected := "text/event-stream; charset=UTF-8"
	if contentType != expected {
		t.Errorf("Unexpected content type, got '%s', extected '%s'", contentType, expected)
	}
	if rw.Code != http.StatusOK {
		t.Errorf("Unexpected response code, got '%d', expected '%d'", rw.Code, http.StatusOK)
	}

	if rw.Body.String() != "\r\ndata: o\r\n\r\n" {
		t.Errorf("Event stream prelude, got '%s'", rw.Body)
	}
}

func TestHandler_EventSourceMultipleConnections(t *testing.T) {
	h := newTestHandler()
	h.options.ResponseLimit = 1024
	rw := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/server/sess/eventsource", nil)
	go func() {
		rw := &ClosableRecorder{httptest.NewRecorder(), nil}
		h.eventSource(rw, req)
		if rw.Body.String() != "\r\ndata: c[2010,\"Another connection still open\"]\r\n\r\n" {
			t.Errorf("wrong, got '%v'", rw.Body)
		}
		h.sessionsMux.Lock()
		sess := h.sessions["sess"]
		sess.close()
		h.sessionsMux.Unlock()
	}()
	h.eventSource(rw, req)
}

func TestHandler_EventSourceConnectionInterrupted(t *testing.T) {
	h := newTestHandler()
	sess := newTestSession()
	sess.state = SessionActive
	h.sessions["session"] = sess
	req, _ := http.NewRequest("POST", "/server/session/eventsource", nil)
	rw := newClosableRecorder()
	close(rw.closeNotifCh)
	h.eventSource(rw, req)
	time.Sleep(1 * time.Millisecond)
	sess.Lock()
	if sess.state != SessionClosed {
		t.Errorf("Session should be closed")
	}
}
