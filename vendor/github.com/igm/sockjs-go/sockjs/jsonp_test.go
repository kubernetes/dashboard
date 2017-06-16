package sockjs

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestHandler_jsonpNoCallback(t *testing.T) {
	h := newTestHandler()
	rw := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/server/session/jsonp", nil)
	h.jsonp(rw, req)
	if rw.Code != http.StatusInternalServerError {
		t.Errorf("Unexpected response code, got '%d', expected '%d'", rw.Code, http.StatusInternalServerError)
	}
	expectedContentType := "text/plain; charset=utf-8"
	if rw.Header().Get("content-type") != expectedContentType {
		t.Errorf("Unexpected content type, got '%s', expected '%s'", rw.Header().Get("content-type"), expectedContentType)
	}
}

func TestHandler_jsonp(t *testing.T) {
	h := newTestHandler()
	rw := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/server/session/jsonp?c=testCallback", nil)
	h.jsonp(rw, req)
	expectedContentType := "application/javascript; charset=UTF-8"
	if rw.Header().Get("content-type") != expectedContentType {
		t.Errorf("Unexpected content type, got '%s', expected '%s'", rw.Header().Get("content-type"), expectedContentType)
	}
	expectedBody := "testCallback(\"o\");\r\n"
	if rw.Body.String() != expectedBody {
		t.Errorf("Unexpected body, got '%s', expected '%s'", rw.Body, expectedBody)
	}
}

func TestHandler_jsonpSendNoPayload(t *testing.T) {
	h := newTestHandler()
	rw := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/server/session/jsonp_send", nil)
	h.jsonpSend(rw, req)
	if rw.Code != http.StatusInternalServerError {
		t.Errorf("Unexpected response code, got '%d', expected '%d'", rw.Code, http.StatusInternalServerError)
	}
}

func TestHandler_jsonpSendWrongPayload(t *testing.T) {
	h := newTestHandler()
	rw := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/server/session/jsonp_send", strings.NewReader("wrong payload"))
	h.jsonpSend(rw, req)
	if rw.Code != http.StatusInternalServerError {
		t.Errorf("Unexpected response code, got '%d', expected '%d'", rw.Code, http.StatusInternalServerError)
	}
}

func TestHandler_jsonpSendNoSession(t *testing.T) {
	h := newTestHandler()
	rw := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/server/session/jsonp_send", strings.NewReader("[\"message\"]"))
	h.jsonpSend(rw, req)
	if rw.Code != http.StatusNotFound {
		t.Errorf("Unexpected response code, got '%d', expected '%d'", rw.Code, http.StatusNotFound)
	}
}

func TestHandler_jsonpSend(t *testing.T) {
	h := newTestHandler()

	rw := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/server/session/jsonp_send", strings.NewReader("[\"message\"]"))

	sess := newSession(req, "session", time.Second, time.Second)
	h.sessions["session"] = sess

	var done = make(chan struct{})
	go func() {
		h.jsonpSend(rw, req)
		close(done)
	}()
	msg, _ := sess.Recv()
	if msg != "message" {
		t.Errorf("Incorrect message in the channel, should be '%s', was '%s'", "some message", msg)
	}
	<-done
	if rw.Code != http.StatusOK {
		t.Errorf("Wrong response status received %d, should be %d", rw.Code, http.StatusOK)
	}
	if rw.Header().Get("content-type") != "text/plain; charset=UTF-8" {
		t.Errorf("Wrong content type received '%s'", rw.Header().Get("content-type"))
	}
	if rw.Body.String() != "ok" {
		t.Errorf("Unexpected body, got '%s', expected 'ok'", rw.Body)
	}
}
