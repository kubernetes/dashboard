package sockjs

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/websocket"
)

func TestHandler_WebSocketHandshakeError(t *testing.T) {
	h := newTestHandler()
	server := httptest.NewServer(http.HandlerFunc(h.sockjsWebsocket))
	defer server.Close()
	req, _ := http.NewRequest("GET", server.URL, nil)
	req.Header.Set("origin", "https"+server.URL[4:])
	resp, _ := http.DefaultClient.Do(req)
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Unexpected response code, got '%d', expected '%d'", resp.StatusCode, http.StatusBadRequest)
	}
}

func TestHandler_WebSocket(t *testing.T) {
	h := newTestHandler()
	server := httptest.NewServer(http.HandlerFunc(h.sockjsWebsocket))
	defer server.CloseClientConnections()
	url := "ws" + server.URL[4:]
	var connCh = make(chan Session)
	h.handlerFunc = func(conn Session) { connCh <- conn }
	conn, resp, err := websocket.DefaultDialer.Dial(url, nil)
	if conn == nil {
		t.Errorf("Connection should not be nil")
	}
	if err != nil {
		t.Errorf("Unexpected error '%v'", err)
	}
	if resp.StatusCode != http.StatusSwitchingProtocols {
		t.Errorf("Wrong response code returned, got '%d', expected '%d'", resp.StatusCode, http.StatusSwitchingProtocols)
	}
	select {
	case <-connCh: //ok
	case <-time.After(10 * time.Millisecond):
		t.Errorf("Sockjs Handler not invoked")
	}
}

func TestHandler_WebSocketTerminationByServer(t *testing.T) {
	h := newTestHandler()
	server := httptest.NewServer(http.HandlerFunc(h.sockjsWebsocket))
	defer server.Close()
	url := "ws" + server.URL[4:]
	h.handlerFunc = func(conn Session) {
		conn.Close(1024, "some close message")
		conn.Close(0, "this should be ignored")
	}
	conn, _, err := websocket.DefaultDialer.Dial(url, map[string][]string{"Origin": []string{server.URL}})
	_, msg, err := conn.ReadMessage()
	if string(msg) != "o" || err != nil {
		t.Errorf("Open frame expected, got '%s' and error '%v', expected '%s' without error", msg, err, "o")
	}
	_, msg, err = conn.ReadMessage()
	if string(msg) != `c[1024,"some close message"]` || err != nil {
		t.Errorf("Open frame expected, got '%s' and error '%v', expected '%s' without error", msg, err, `c[1024,"some close message"]`)
	}
	_, msg, err = conn.ReadMessage()
	// gorilla websocket keeps `errUnexpectedEOF` private so we need to introspect the error message
	if err != nil {
		if !strings.Contains(err.Error(), "unexpected EOF") {
			t.Errorf("Expected 'unexpected EOF' error or similar, got '%v'", err)
		}
	}
}

func TestHandler_WebSocketTerminationByClient(t *testing.T) {
	h := newTestHandler()
	server := httptest.NewServer(http.HandlerFunc(h.sockjsWebsocket))
	defer server.Close()
	url := "ws" + server.URL[4:]
	var done = make(chan struct{})
	h.handlerFunc = func(conn Session) {
		if _, err := conn.Recv(); err != ErrSessionNotOpen {
			t.Errorf("Recv should fail")
		}
		close(done)
	}
	conn, _, _ := websocket.DefaultDialer.Dial(url, map[string][]string{"Origin": []string{server.URL}})
	conn.Close()
	<-done
}

func TestHandler_WebSocketCommunication(t *testing.T) {
	h := newTestHandler()
	server := httptest.NewServer(http.HandlerFunc(h.sockjsWebsocket))
	// defer server.CloseClientConnections()
	url := "ws" + server.URL[4:]
	var done = make(chan struct{})
	h.handlerFunc = func(conn Session) {
		conn.Send("message 1")
		conn.Send("message 2")
		msg, err := conn.Recv()
		if msg != "message 3" || err != nil {
			t.Errorf("Got '%s', expecte '%s'", msg, "message 3")
		}
		conn.Close(123, "close")
		close(done)
	}
	conn, _, _ := websocket.DefaultDialer.Dial(url, map[string][]string{"Origin": []string{server.URL}})
	conn.WriteJSON([]string{"message 3"})
	var expected = []string{"o", `a["message 1"]`, `a["message 2"]`, `c[123,"close"]`}
	for _, exp := range expected {
		_, msg, err := conn.ReadMessage()
		if string(msg) != exp || err != nil {
			t.Errorf("Wrong frame, got '%s' and error '%v', expected '%s' without error", msg, err, exp)
		}
	}
	<-done
}
