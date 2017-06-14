package sockjs

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
)
import "testing"

func TestInfoGet(t *testing.T) {
	recorder := httptest.NewRecorder()
	request, _ := http.NewRequest("GET", "", nil)
	DefaultOptions.info(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Errorf("Wrong status code, got '%d' expected '%d'", recorder.Code, http.StatusOK)
	}

	decoder := json.NewDecoder(recorder.Body)
	var a info
	decoder.Decode(&a)
	if !a.Websocket {
		t.Errorf("Websocket field should be set true")
	}
	if a.CookieNeeded {
		t.Errorf("CookieNeeded should be set to false")
	}
}

func TestInfoOptions(t *testing.T) {
	recorder := httptest.NewRecorder()
	request, _ := http.NewRequest("OPTIONS", "", nil)
	DefaultOptions.info(recorder, request)
	if recorder.Code != http.StatusNoContent {
		t.Errorf("Incorrect status code received, got '%d' expected '%d'", recorder.Code, http.StatusNoContent)
	}
}

func TestInfoUnknown(t *testing.T) {
	req, _ := http.NewRequest("PUT", "", nil)
	rec := httptest.NewRecorder()
	DefaultOptions.info(rec, req)
	if rec.Code != http.StatusNotFound {
		t.Errorf("Incorrec response status, got '%d' expected '%d'", rec.Code, http.StatusNotFound)
	}
}

func TestCookies(t *testing.T) {
	rec := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "", nil)
	optionsWithCookies := DefaultOptions
	optionsWithCookies.JSessionID = DefaultJSessionID
	optionsWithCookies.cookie(rec, req)
	if rec.Header().Get("set-cookie") != "JSESSIONID=dummy; Path=/" {
		t.Errorf("Cookie not properly set in response")
	}
	// cookie value set in request
	req.AddCookie(&http.Cookie{Name: "JSESSIONID", Value: "some_jsession_id", Path: "/"})
	rec = httptest.NewRecorder()
	optionsWithCookies.cookie(rec, req)
	if rec.Header().Get("set-cookie") != "JSESSIONID=some_jsession_id; Path=/" {
		t.Errorf("Cookie not properly set in response")
	}
}
