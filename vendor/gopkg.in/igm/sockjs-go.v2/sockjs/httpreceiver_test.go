package sockjs

import (
	"io"
	"net/http/httptest"
	"testing"
)

type testFrameWriter struct {
	frames []string
}

func (t *testFrameWriter) write(w io.Writer, frame string) (int, error) {
	t.frames = append(t.frames, frame)
	return len(frame), nil
}

func TestHttpReceiver_Create(t *testing.T) {
	rec := httptest.NewRecorder()
	recv := newHTTPReceiver(rec, 1024, new(testFrameWriter))
	if recv.doneCh != recv.doneNotify() {
		t.Errorf("Calling done() must return close channel, but it does not")
	}
	if recv.rw != rec {
		t.Errorf("Http.ResponseWriter not properly initialized")
	}
	if recv.maxResponseSize != 1024 {
		t.Errorf("MaxResponseSize not properly initialized")
	}
}

func TestHttpReceiver_SendEmptyFrames(t *testing.T) {
	rec := httptest.NewRecorder()
	recv := newHTTPReceiver(rec, 1024, new(testFrameWriter))
	recv.sendBulk()
	if rec.Body.String() != "" {
		t.Errorf("Incorrect body content received from receiver '%s'", rec.Body.String())
	}
}

func TestHttpReceiver_SendFrame(t *testing.T) {
	rec := httptest.NewRecorder()
	fw := new(testFrameWriter)
	recv := newHTTPReceiver(rec, 1024, fw)
	var frame = "some frame content"
	recv.sendFrame(frame)
	if len(fw.frames) != 1 || fw.frames[0] != frame {
		t.Errorf("Incorrect body content received, got '%s', expected '%s'", fw.frames, frame)
	}

}

func TestHttpReceiver_SendBulk(t *testing.T) {
	rec := httptest.NewRecorder()
	fw := new(testFrameWriter)
	recv := newHTTPReceiver(rec, 1024, fw)
	recv.sendBulk("message 1", "message 2", "message 3")
	expected := "a[\"message 1\",\"message 2\",\"message 3\"]"
	if len(fw.frames) != 1 || fw.frames[0] != expected {
		t.Errorf("Incorrect body content received from receiver, got '%s' expected '%s'", fw.frames, expected)
	}
}

func TestHttpReceiver_MaximumResponseSize(t *testing.T) {
	rec := httptest.NewRecorder()
	recv := newHTTPReceiver(rec, 52, new(testFrameWriter))
	recv.sendBulk("message 1", "message 2") // produces 26 bytes of response in 1 frame
	if recv.currentResponseSize != 26 {
		t.Errorf("Incorrect response size calcualated, got '%d' expected '%d'", recv.currentResponseSize, 26)
	}
	select {
	case <-recv.doneNotify():
		t.Errorf("Receiver should not be done yet")
	default: // ok
	}
	recv.sendBulk("message 1", "message 2") // produces another 26 bytes of response in 1 frame to go over max resposne size
	select {
	case <-recv.doneNotify(): // ok
	default:
		t.Errorf("Receiver closed channel did not close")
	}
}

func TestHttpReceiver_Close(t *testing.T) {
	rec := httptest.NewRecorder()
	recv := newHTTPReceiver(rec, 1024, nil)
	recv.close()
	if recv.state != stateHTTPReceiverClosed {
		t.Errorf("Unexpected state, got '%d', expected '%d'", recv.state, stateHTTPReceiverClosed)
	}
}

func TestHttpReceiver_ConnectionInterrupt(t *testing.T) {
	rw := newClosableRecorder()
	recv := newHTTPReceiver(rw, 1024, nil)
	rw.closeNotifCh <- true
	recv.Lock()
	if recv.state != stateHTTPReceiverClosed {
		t.Errorf("Unexpected state, got '%d', expected '%d'", recv.state, stateHTTPReceiverClosed)
	}
}
