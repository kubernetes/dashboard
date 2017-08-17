package sockjs

import (
	"bufio"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"sync"
	"testing"
)

func BenchmarkSimple(b *testing.B) {
	var messages = make(chan string, 10)
	h := NewHandler("/echo", DefaultOptions, func(session Session) {
		for m := range messages {
			session.Send(m)
		}
		session.Close(1024, "Close")
	})
	server := httptest.NewServer(h)
	defer server.Close()

	req, _ := http.NewRequest("POST", server.URL+fmt.Sprintf("/echo/server/%d/xhr_streaming", 1000), nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Fatal(err)
	}
	for n := 0; n < b.N; n++ {
		messages <- "some message"
	}
	fmt.Println(b.N)
	close(messages)
	resp.Body.Close()
}

func BenchmarkMessages(b *testing.B) {
	msg := strings.Repeat("m", 10)
	h := NewHandler("/echo", DefaultOptions, func(session Session) {
		for n := 0; n < b.N; n++ {
			session.Send(msg)
		}
		session.Close(1024, "Close")
	})
	server := httptest.NewServer(h)

	var wg sync.WaitGroup

	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func(session int) {
			reqc := 0
			// req, _ := http.NewRequest("POST", server.URL+fmt.Sprintf("/echo/server/%d/xhr_streaming", session), nil)
			req, _ := http.NewRequest("GET", server.URL+fmt.Sprintf("/echo/server/%d/eventsource", session), nil)
			for {
				reqc++
				resp, err := http.DefaultClient.Do(req)
				if err != nil {
					log.Fatal(err)
				}
				reader := bufio.NewReader(resp.Body)
				for {
					line, err := reader.ReadString('\n')
					if err != nil {
						goto AGAIN
					}
					if strings.HasPrefix(line, "data: c[1024") {
						resp.Body.Close()
						goto DONE
					}
				}
			AGAIN:
				resp.Body.Close()
			}
		DONE:
			wg.Done()
		}(i)
	}
	wg.Wait()
	server.Close()
}

func BenchmarkHandler_ParseSessionID(b *testing.B) {
	h := handler{prefix: "/prefix"}
	url, _ := url.Parse("http://server:80/prefix/server/session/whatever")

	b.ReportAllocs()
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		h.parseSessionID(url)
	}
}
