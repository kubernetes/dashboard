package sockjs

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHandler_iframe(t *testing.T) {
	h := newTestHandler()
	h.options.SockJSURL = "http://sockjs.com/sockjs.js"
	rw := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/server/sess/iframe", nil)
	h.iframe(rw, req)
	if rw.Body.String() != expected {
		t.Errorf("Unexpected html content,\ngot:\n'%s'\n\nexpected\n'%s'", rw.Body, expected)
	}
	eTag := rw.Header().Get("etag")
	req.Header.Set("if-none-match", eTag)
	rw = httptest.NewRecorder()
	h.iframe(rw, req)
	if rw.Code != http.StatusNotModified {
		t.Errorf("Unexpected response, got '%d', expected '%d'", rw.Code, http.StatusNotModified)
	}
}

var expected = `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <script>
    document.domain = document.domain;
    _sockjs_onload = function(){SockJS.bootstrap_iframe();};
  </script>
  <script src="http://sockjs.com/sockjs.js"></script>
</head>
<body>
  <h2>Don't panic!</h2>
  <p>This is a SockJS hidden iframe. It's used for cross domain magic.</p>
</body>
</html>`
