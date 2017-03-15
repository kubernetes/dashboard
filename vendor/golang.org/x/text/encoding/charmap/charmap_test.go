// Copyright 2015 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package charmap

import (
	"testing"

	"golang.org/x/text/encoding"
	"golang.org/x/text/encoding/internal"
	"golang.org/x/text/transform"
)

func dec(e encoding.Encoding) (dir string, t transform.Transformer, err error) {
	return "Decode", e.NewDecoder(), nil
}
func encASCIISuperset(e encoding.Encoding) (dir string, t transform.Transformer, err error) {
	return "Encode", e.NewEncoder(), internal.ErrASCIIReplacement
}
func encEBCDIC(e encoding.Encoding) (dir string, t transform.Transformer, err error) {
	return "Encode", e.NewEncoder(), internal.RepertoireError(0x3f)
}

func TestNonRepertoire(t *testing.T) {
	testCases := []struct {
		init      func(e encoding.Encoding) (string, transform.Transformer, error)
		e         encoding.Encoding
		src, want string
	}{
		{dec, Windows1252, "\x81", "\ufffd"},

		{encEBCDIC, CodePage037, "갂", ""},

		{encEBCDIC, CodePage1047, "갂", ""},
		{encEBCDIC, CodePage1047, "a¤갂", "\x81\x9F"},

		{encEBCDIC, CodePage1140, "갂", ""},
		{encEBCDIC, CodePage1140, "a€갂", "\x81\x9F"},

		{encASCIISuperset, Windows1252, "갂", ""},
		{encASCIISuperset, Windows1252, "a갂", "a"},
		{encASCIISuperset, Windows1252, "\u00E9갂", "\xE9"},
	}
	for _, tc := range testCases {
		dir, tr, wantErr := tc.init(tc.e)

		dst, _, err := transform.String(tr, tc.src)
		if err != wantErr {
			t.Errorf("%s %v(%q): got %v; want %v", dir, tc.e, tc.src, err, wantErr)
		}
		if got := string(dst); got != tc.want {
			t.Errorf("%s %v(%q):\ngot  %q\nwant %q", dir, tc.e, tc.src, got, tc.want)
		}
	}
}
