package sockjs

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestXhrCors(t *testing.T) {
	recorder := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/", nil)
	xhrCors(recorder, req)
	acao := recorder.Header().Get("access-control-allow-origin")
	if acao != "*" {
		t.Errorf("Incorrect value for access-control-allow-origin header, got %s, expected %s", acao, "*")
	}
	req.Header.Set("origin", "localhost")
	xhrCors(recorder, req)
	acao = recorder.Header().Get("access-control-allow-origin")
	if acao != "localhost" {
		t.Errorf("Incorrect value for access-control-allow-origin header, got %s, expected %s", acao, "localhost")
	}

	req.Header.Set("access-control-request-headers", "some value")
	rec := httptest.NewRecorder()
	xhrCors(rec, req)
	if rec.Header().Get("access-control-allow-headers") != "some value" {
		t.Errorf("Incorent value for ACAH, got %s", rec.Header().Get("access-control-allow-headers"))
	}

	rec = httptest.NewRecorder()
	xhrCors(rec, req)
	if rec.Header().Get("access-control-allow-credentials") != "true" {
		t.Errorf("Incorent value for ACAC, got %s", rec.Header().Get("access-control-allow-credentials"))
	}

	// verify that if Access-Control-Allow-Credentials was previously set that xhrCors() does not duplicate the value
	rec = httptest.NewRecorder()
	rec.Header().Set("Access-Control-Allow-Credentials", "true")
	xhrCors(rec, req)
	acac := rec.Header()["Access-Control-Allow-Credentials"]
	if len(acac) != 1 || acac[0] != "true" {
		t.Errorf("Incorent value for ACAC, got %s", strings.Join(acac, ","))
	}
}

func TestXhrOptions(t *testing.T) {
	rec := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/", nil)
	xhrOptions(rec, req)
	if rec.Code != http.StatusNoContent {
		t.Errorf("Wrong response status code, expected %d, got %d", http.StatusNoContent, rec.Code)
	}
}

func TestCacheFor(t *testing.T) {
	rec := httptest.NewRecorder()
	cacheFor(rec, nil)
	cacheControl := rec.Header().Get("cache-control")
	if cacheControl != "public, max-age=31536000" {
		t.Errorf("Incorrect cache-control header value, got '%s'", cacheControl)
	}
	expires := rec.Header().Get("expires")
	if expires == "" {
		t.Errorf("Expires header should not be empty") // TODO(igm) check proper formating of string
	}
	maxAge := rec.Header().Get("access-control-max-age")
	if maxAge != "31536000" {
		t.Errorf("Incorrect value for access-control-max-age, got '%s'", maxAge)
	}
}

func TestNoCache(t *testing.T) {
	rec := httptest.NewRecorder()
	noCache(rec, nil)
}

func TestWelcomeHandler(t *testing.T) {
	rec := httptest.NewRecorder()
	welcomeHandler(rec, nil)
	if rec.Body.String() != "Welcome to SockJS!\n" {
		t.Errorf("Incorrect welcome message received, got '%s'", rec.Body.String())
	}
}
