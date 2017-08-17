package sockjs

import "testing"

func TestQuote(t *testing.T) {
	var quotationTests = []struct {
		input  string
		output string
	}{
		{"simple", "\"simple\""},
		{"more complex \"", "\"more complex \\\"\""},
	}

	for _, testCase := range quotationTests {
		if quote(testCase.input) != testCase.output {
			t.Errorf("Expected '%s', got '%s'", testCase.output, quote(testCase.input))
		}
	}
}
