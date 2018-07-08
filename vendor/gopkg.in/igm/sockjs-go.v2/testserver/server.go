package main

import (
	"io"
	"log"
	"net/http"
	"strings"

	"golang.org/x/net/websocket"
	"gopkg.in/igm/sockjs-go.v2/sockjs"
)

type testHandler struct {
	prefix  string
	handler http.Handler
}

func newSockjsHandler(prefix string, options sockjs.Options, fn func(sockjs.Session)) *testHandler {
	return &testHandler{prefix, sockjs.NewHandler(prefix, options, fn)}
}

type testHandlers []*testHandler

func main() {
	// prepare various options for tests
	echoOptions := sockjs.DefaultOptions
	echoOptions.ResponseLimit = 4096

	disabledWebsocketOptions := sockjs.DefaultOptions
	disabledWebsocketOptions.Websocket = false

	cookieNeededOptions := sockjs.DefaultOptions
	cookieNeededOptions.JSessionID = sockjs.DefaultJSessionID
	// register various test handlers
	var handlers = []*testHandler{
		&testHandler{"/echo/websocket", websocket.Handler(echoWsHandler)},
		&testHandler{"/close/websocket", websocket.Handler(closeWsHandler)},
		newSockjsHandler("/echo", echoOptions, echoHandler),
		newSockjsHandler("/echo", echoOptions, echoHandler),
		newSockjsHandler("/cookie_needed_echo", cookieNeededOptions, echoHandler),
		newSockjsHandler("/close", sockjs.DefaultOptions, closeHandler),
		newSockjsHandler("/disabled_websocket_echo", disabledWebsocketOptions, echoHandler),
	}
	log.Fatal(http.ListenAndServe(":8081", testHandlers(handlers)))
}

func (t testHandlers) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	for _, handler := range t {
		if strings.HasPrefix(req.URL.Path, handler.prefix) {
			handler.handler.ServeHTTP(rw, req)
			return
		}
	}
	http.NotFound(rw, req)
}

func closeWsHandler(ws *websocket.Conn) { ws.Close() }
func echoWsHandler(ws *websocket.Conn)  { io.Copy(ws, ws) }

func closeHandler(conn sockjs.Session) { conn.Close(3000, "Go away!") }
func echoHandler(conn sockjs.Session) {
	log.Println("New connection created")
	for {
		if msg, err := conn.Recv(); err != nil {
			break
		} else {
			if err := conn.Send(msg); err != nil {
				break
			}
		}
	}
	log.Println("Sessionection closed")
}
