// Copyright 2015 Maxim Kupriianov. All rights reserved.
// Use of this source code is governed by the MIT license
// that can be found in the LICENSE file.

/*
Package handysort implements an alphanumeric string comparison function
in order to sort alphanumeric strings correctly.

Default sort (incorrect):
	abc1
	abc10
	abc12
	abc2

Handysort:
	abc1
	abc2
	abc10
	abc12

Please note, that handysort is about 5x-8x times slower
than a simple sort, so use it wisely.
*/
package handysort

import "unicode/utf8"

// Strings implements the sort interface, sorts an array
// of the alphanumeric strings in decreasing order.
type Strings []string

func (a Strings) Len() int           { return len(a) }
func (a Strings) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a Strings) Less(i, j int) bool { return StringLess(a[i], a[j]) }

// StringLess compares two alphanumeric strings correctly.
func StringLess(s1, s2 string) (less bool) {
	var b1, b2 []rune
	var r1, r2 rune
	var e1, e2 bool
	var d1, d2 bool
	var i, j int

	for !e1 || !e2 {
		// read rune from former string available
		r1, i, e1 = advanceRune(i, s1)
		if !e1 {
			if d1 = ('0' <= r1 && r1 <= '9'); d1 {
				// if digit, fill numeric buffer
				b1, i, e1 = fillBuffer(r1, i, s1, true)
			} else {
				// symbolic otherwise
				b1, i, e1 = fillBuffer(r1, i, s1, false)
			}
		}

		// read rune from latter string if available
		r2, j, e2 = advanceRune(j, s2)
		if !e2 {
			if d2 = ('0' <= r2 && r2 <= '9'); d2 {
				// if digit, accumulate
				b2, j, e2 = fillBuffer(r2, j, s2, true)
			} else {
				// symbolic otherwise
				b2, j, e2 = fillBuffer(r2, j, s2, false)
			}
		}

		if d1 && d2 {
			// compare digits in buffers (both are numeric)
			less, greater, equal := compareByDigits(b1, b2)
			if less {
				return true
			} else if greater {
				return false
			} else if !equal {
				return less
			}
		} else if !d1 && !d2 {
			// compare chars in buffers (both are symbolic)
			less, greater, equal := compareByChars(b1, b2)
			if less {
				return true
			} else if greater {
				return false
			} else if !equal {
				return less
			}
		} else {
			return r1 < r2
		}
		d1, d2 = false, false
		b1, b2 = nil, nil
	}

	return len(s1) < len(s2)
}

func fillBuffer(initial rune, ptr int, str string, numeric bool) (buf []rune, i int, end bool) {
	buf = make([]rune, 0, len(str)-ptr+1)
	buf = append(buf, initial)
	i = ptr
	var r rune
	var e bool
	var d bool
	for {
		// read rune from former string available
		r, i, e = advanceRune(i, str)
		if e {
			return
		}
		// if digit & numeric field, accumulate
		if d = ('0' <= r && r <= '9'); d && numeric {
			buf = append(buf, r)
		} else if !d && !numeric {
			buf = append(buf, r)
		} else {
			i-- // undo 1-step advance
			return
		}
	}
}

// Advances offset in str, returns current rune if not end.
func advanceRune(ptr int, str string) (r rune, i int, end bool) {
	if ptr < len(str) {
		var w int
		r, w = utf8.DecodeRuneInString(str[ptr:])
		i = ptr + w
		return
	}
	return 0, ptr, true
}

func compareByChars(c1, c2 []rune) (less, greater, equal bool) {
	c1c2 := len(c1) < len(c2)
	var minLen int
	// get the minimum length
	if c1c2 {
		minLen = len(c1)
	} else {
		minLen = len(c2)
	}
	for i := range make([]struct{}, minLen) {
		equal = c1[i] == c2[i]
		if !equal {
			if c1[i] < c2[i] {
				less = true
				greater = false
				return
			}
			less = false
			greater = true
			return
		}
	}
	equal = len(c1) == len(c2)
	if !equal {
		if c1c2 {
			less = true
			greater = false
			return
		}
		less = false
		greater = true
		return
	}
	return false, false, true
}

// Compares two numeric fields by their digits, if equal then
// compares initial lengths of the numeric fields provided.
func compareByDigits(n1, n2 []rune) (less, greater, equal bool) {
	offset := len(n2) - len(n1)
	n1n2 := offset < 0 // len(n1) > len(n2)
	if n1n2 {
		// if n1 longer, swap with n2
		offset = -offset
		n1, n2 = n2, n1
	}

	var j int
	// len(n1) always be <= len(n2)
	for i := range n2 {
		var r1 rune
		if offset == 0 {
			// begin actual read
			r1 = n1[j]
			j++
		} else {
			// emulate zero-padding
			r1 = '0'
			offset--
		}

		r2 := n2[i]
		if r1 != r2 {
			if n1n2 {
				return r2 < r1, r2 > r1, false // actually r1 < r2
			}
			return r1 < r2, r1 > r2, false
		}
	}

	// numeric value equals, compare by length
	if n1n2 {
		// n1 was > n2
		return false, true, true
	}
	// eval a comparison only if n1 known to be <= n2
	return len(n1) < len(n2), len(n1) > len(n2), true
}
