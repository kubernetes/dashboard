// Copyright 2016 The CMux Authors. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
// implied. See the License for the specific language governing
// permissions and limitations under the License.

package cmux

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net"
	"net/http"
	"net/rpc"
	"runtime"
	"sort"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"golang.org/x/net/http2"
)

const (
	testHTTP1Resp = "http1"
	rpcVal        = 1234
)

func safeServe(errCh chan<- error, muxl CMux) {
	if err := muxl.Serve(); !strings.Contains(err.Error(), "use of closed network connection") {
		errCh <- err
	}
}

func safeDial(t *testing.T, addr net.Addr) (*rpc.Client, func()) {
	c, err := rpc.Dial(addr.Network(), addr.String())
	if err != nil {
		t.Fatal(err)
	}
	return c, func() {
		if err := c.Close(); err != nil {
			t.Fatal(err)
		}
	}
}

type chanListener struct {
	net.Listener
	connCh chan net.Conn
}

func newChanListener() *chanListener {
	return &chanListener{connCh: make(chan net.Conn, 1)}
}

func (l *chanListener) Accept() (net.Conn, error) {
	if c, ok := <-l.connCh; ok {
		return c, nil
	}
	return nil, errors.New("use of closed network connection")
}

func testListener(t *testing.T) (net.Listener, func()) {
	l, err := net.Listen("tcp", ":0")
	if err != nil {
		t.Fatal(err)
	}
	return l, func() {
		if err := l.Close(); err != nil {
			t.Fatal(err)
		}
	}
}

type testHTTP1Handler struct{}

func (h *testHTTP1Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, testHTTP1Resp)
}

func runTestHTTPServer(errCh chan<- error, l net.Listener) {
	var mu sync.Mutex
	conns := make(map[net.Conn]struct{})

	defer func() {
		mu.Lock()
		for c := range conns {
			if err := c.Close(); err != nil {
				errCh <- err
			}
		}
		mu.Unlock()
	}()

	s := &http.Server{
		Handler: &testHTTP1Handler{},
		ConnState: func(c net.Conn, state http.ConnState) {
			mu.Lock()
			switch state {
			case http.StateNew:
				conns[c] = struct{}{}
			case http.StateClosed:
				delete(conns, c)
			}
			mu.Unlock()
		},
	}
	if err := s.Serve(l); err != ErrListenerClosed {
		errCh <- err
	}
}

func runTestHTTP1Client(t *testing.T, addr net.Addr) {
	if r, err := http.Get("http://" + addr.String()); err != nil {
		t.Fatal(err)
	} else {
		defer func() {
			if err := r.Body.Close(); err != nil {
				t.Fatal(err)
			}
		}()
		if b, err := ioutil.ReadAll(r.Body); err != nil {
			t.Fatal(err)
		} else {
			if string(b) != testHTTP1Resp {
				t.Fatalf("invalid response: want=%s got=%s", testHTTP1Resp, b)
			}
		}
	}
}

type TestRPCRcvr struct{}

func (r TestRPCRcvr) Test(i int, j *int) error {
	*j = i
	return nil
}

func runTestRPCServer(errCh chan<- error, l net.Listener) {
	s := rpc.NewServer()
	if err := s.Register(TestRPCRcvr{}); err != nil {
		errCh <- err
	}
	for {
		c, err := l.Accept()
		if err != nil {
			if err != ErrListenerClosed {
				errCh <- err
			}
			return
		}
		go s.ServeConn(c)
	}
}

func runTestRPCClient(t *testing.T, addr net.Addr) {
	c, cleanup := safeDial(t, addr)
	defer cleanup()

	var num int
	if err := c.Call("TestRPCRcvr.Test", rpcVal, &num); err != nil {
		t.Fatal(err)
	}

	if num != rpcVal {
		t.Errorf("wrong rpc response: want=%d got=%v", rpcVal, num)
	}
}

func TestRead(t *testing.T) {
	defer leakCheck(t)()
	errCh := make(chan error)
	defer func() {
		select {
		case err := <-errCh:
			t.Fatal(err)
		default:
		}
	}()
	const payload = "hello world\r\n"
	const mult = 2

	writer, reader := net.Pipe()
	go func() {
		if _, err := io.WriteString(writer, strings.Repeat(payload, mult)); err != nil {
			t.Fatal(err)
		}
		if err := writer.Close(); err != nil {
			t.Fatal(err)
		}
	}()

	l := newChanListener()
	defer close(l.connCh)
	l.connCh <- reader
	muxl := New(l)
	// Register a bogus matcher to force buffering exactly the right amount.
	// Before this fix, this would trigger a bug where `Read` would incorrectly
	// report `io.EOF` when only the buffer had been consumed.
	muxl.Match(func(r io.Reader) bool {
		var b [len(payload)]byte
		_, _ = r.Read(b[:])
		return false
	})
	anyl := muxl.Match(Any())
	go safeServe(errCh, muxl)
	muxedConn, err := anyl.Accept()
	if err != nil {
		t.Fatal(err)
	}
	for i := 0; i < mult; i++ {
		var b [len(payload)]byte
		if n, err := muxedConn.Read(b[:]); err != nil {
			t.Error(err)
		} else if e := len(b); n != e {
			t.Errorf("expected to read %d bytes, but read %d bytes", e, n)
		}
	}
	var b [1]byte
	if _, err := muxedConn.Read(b[:]); err != io.EOF {
		t.Errorf("unexpected error %v, expected %v", err, io.EOF)
	}
}

func TestAny(t *testing.T) {
	defer leakCheck(t)()
	errCh := make(chan error)
	defer func() {
		select {
		case err := <-errCh:
			t.Fatal(err)
		default:
		}
	}()
	l, cleanup := testListener(t)
	defer cleanup()

	muxl := New(l)
	httpl := muxl.Match(Any())

	go runTestHTTPServer(errCh, httpl)
	go safeServe(errCh, muxl)

	runTestHTTP1Client(t, l.Addr())
}

func TestHTTP2(t *testing.T) {
	defer leakCheck(t)()
	errCh := make(chan error)
	defer func() {
		select {
		case err := <-errCh:
			t.Fatal(err)
		default:
		}
	}()
	writer, reader := net.Pipe()
	go func() {
		if _, err := io.WriteString(writer, http2.ClientPreface); err != nil {
			t.Fatal(err)
		}
		if err := writer.Close(); err != nil {
			t.Fatal(err)
		}
	}()

	l := newChanListener()
	l.connCh <- reader
	muxl := New(l)
	// Register a bogus matcher that only reads one byte.
	muxl.Match(func(r io.Reader) bool {
		var b [1]byte
		_, _ = r.Read(b[:])
		return false
	})
	h2l := muxl.Match(HTTP2())
	go safeServe(errCh, muxl)
	muxedConn, err := h2l.Accept()
	close(l.connCh)
	if err != nil {
		t.Fatal(err)
	}
	{
		var b [len(http2.ClientPreface)]byte
		if _, err := muxedConn.Read(b[:]); err != nil {
			t.Fatal(err)
		}
		if string(b[:]) != http2.ClientPreface {
			t.Errorf("got unexpected read %s, expected %s", b, http2.ClientPreface)
		}
	}
	{
		var b [1]byte
		if _, err := muxedConn.Read(b[:]); err != io.EOF {
			t.Errorf("unexpected error %v, expected %v", err, io.EOF)
		}
	}
}

func TestHTTPGoRPC(t *testing.T) {
	defer leakCheck(t)()
	errCh := make(chan error)
	defer func() {
		select {
		case err := <-errCh:
			t.Fatal(err)
		default:
		}
	}()
	l, cleanup := testListener(t)
	defer cleanup()

	muxl := New(l)
	httpl := muxl.Match(HTTP2(), HTTP1Fast())
	rpcl := muxl.Match(Any())

	go runTestHTTPServer(errCh, httpl)
	go runTestRPCServer(errCh, rpcl)
	go safeServe(errCh, muxl)

	runTestHTTP1Client(t, l.Addr())
	runTestRPCClient(t, l.Addr())
}

func TestErrorHandler(t *testing.T) {
	defer leakCheck(t)()
	errCh := make(chan error)
	defer func() {
		select {
		case err := <-errCh:
			t.Fatal(err)
		default:
		}
	}()
	l, cleanup := testListener(t)
	defer cleanup()

	muxl := New(l)
	httpl := muxl.Match(HTTP2(), HTTP1Fast())

	go runTestHTTPServer(errCh, httpl)
	go safeServe(errCh, muxl)

	var errCount uint32
	muxl.HandleError(func(err error) bool {
		if atomic.AddUint32(&errCount, 1) == 1 {
			if _, ok := err.(ErrNotMatched); !ok {
				t.Errorf("unexpected error: %v", err)
			}
		}
		return true
	})

	c, cleanup := safeDial(t, l.Addr())
	defer cleanup()

	var num int
	for atomic.LoadUint32(&errCount) == 0 {
		if err := c.Call("TestRPCRcvr.Test", rpcVal, &num); err == nil {
			// The connection is simply closed.
			t.Errorf("unexpected rpc success after %d errors", atomic.LoadUint32(&errCount))
		}
	}
}

func TestClose(t *testing.T) {
	defer leakCheck(t)()
	errCh := make(chan error)
	defer func() {
		select {
		case err := <-errCh:
			t.Fatal(err)
		default:
		}
	}()
	l := newChanListener()

	c1, c2 := net.Pipe()

	muxl := New(l)
	anyl := muxl.Match(Any())

	go safeServe(errCh, muxl)

	l.connCh <- c1

	// First connection goes through.
	if _, err := anyl.Accept(); err != nil {
		t.Fatal(err)
	}

	// Second connection is sent
	l.connCh <- c2

	// Listener is closed.
	close(l.connCh)

	// Second connection either goes through or it is closed.
	if _, err := anyl.Accept(); err != nil {
		if err != ErrListenerClosed {
			t.Fatal(err)
		}
		if _, err := c2.Read([]byte{}); err != io.ErrClosedPipe {
			t.Fatalf("connection is not closed and is leaked: %v", err)
		}
	}
}

// Cribbed from google.golang.org/grpc/test/end2end_test.go.

// interestingGoroutines returns all goroutines we care about for the purpose
// of leak checking. It excludes testing or runtime ones.
func interestingGoroutines() (gs []string) {
	buf := make([]byte, 2<<20)
	buf = buf[:runtime.Stack(buf, true)]
	for _, g := range strings.Split(string(buf), "\n\n") {
		sl := strings.SplitN(g, "\n", 2)
		if len(sl) != 2 {
			continue
		}
		stack := strings.TrimSpace(sl[1])
		if strings.HasPrefix(stack, "testing.RunTests") {
			continue
		}

		if stack == "" ||
			strings.Contains(stack, "testing.Main(") ||
			strings.Contains(stack, "runtime.goexit") ||
			strings.Contains(stack, "created by runtime.gc") ||
			strings.Contains(stack, "interestingGoroutines") ||
			strings.Contains(stack, "runtime.MHeap_Scavenger") {
			continue
		}
		gs = append(gs, g)
	}
	sort.Strings(gs)
	return
}

// leakCheck snapshots the currently-running goroutines and returns a
// function to be run at the end of tests to see whether any
// goroutines leaked.
func leakCheck(t testing.TB) func() {
	orig := map[string]bool{}
	for _, g := range interestingGoroutines() {
		orig[g] = true
	}
	return func() {
		// Loop, waiting for goroutines to shut down.
		// Wait up to 5 seconds, but finish as quickly as possible.
		deadline := time.Now().Add(5 * time.Second)
		for {
			var leaked []string
			for _, g := range interestingGoroutines() {
				if !orig[g] {
					leaked = append(leaked, g)
				}
			}
			if len(leaked) == 0 {
				return
			}
			if time.Now().Before(deadline) {
				time.Sleep(50 * time.Millisecond)
				continue
			}
			for _, g := range leaked {
				t.Errorf("Leaked goroutine: %v", g)
			}
			return
		}
	}
}
