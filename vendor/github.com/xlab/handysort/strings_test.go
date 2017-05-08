package handysort

import (
	"math/rand"
	"reflect"
	"sort"
	"strconv"
	"testing"
)

func TestStringSort(t *testing.T) {
	a := []string{
		"abc1", "abc2",
		"abc5", "abc10",
	}
	b := []string{
		"abc5", "abc1",
		"abc10", "abc2",
	}
	sort.Sort(Strings(b))
	if !reflect.DeepEqual(a, b) {
		t.Errorf("Error: sort failed, expected: %v, got: %v", a, b)
	}
}

func TestStringLess(t *testing.T) {
	testset := []struct {
		s1, s2 string
		less   bool
	}{
		{"2", "3", true},
		{"0", "00", true},
		{"00", "0", false},
		{"aa", "ab", true},
		{"ab", "abc", true},
		{"abc", "ad", true},
		{"ab1", "ab2", true},
		{"ab1c", "ab1c", false},
		{"ab12", "abc", true},
		{"ab2a", "ab10", true},
		{"a0001", "a0000001", true},
		{"a10", "abcdefgh2", true},
		{"аб2аб", "аб10аб", true},
		{"2аб", "3аб", true},
		//
		{"a1b", "a01b", true},
		{"a01b", "a1b", false},
		{"ab01b", "ab010b", true},
		{"ab010b", "ab01b", false},
		{"a01b001", "a001b01", true},
		{"a001b01", "a01b001", false},
		{"a1", "a1x", true},
		{"a1x", "a1", false},
		{"a1", "a", false},
		{"a", "a1", true},
		{"1ax", "1b", true},
		{"1b", "1ax", false},
		{"1a10", "2", true},
		{"2", "1a10", false},
		//
		{"082", "83", true},
	}

	for _, v := range testset {
		if res := StringLess(v.s1, v.s2); res != v.less {
			t.Errorf("Compared %s to %s: expected %v, got %v",
				v.s1, v.s2, v.less, res)
		}
	}
}

func BenchmarkStringSort(b *testing.B) {
	set := testSet(300)
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		sort.Strings(set[b.N%1000])
	}
}

func BenchmarkHandyStringSort(b *testing.B) {
	set := testSet(300)
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		sort.Sort(Strings(set[b.N%1000]))
	}
}

func BenchmarkStringLess(b *testing.B) {
	set := testSet(300)
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		n := b.N % 999
		_ = StringLess(set[n][0], set[n+1][1])
	}
}

// Get 1000 arrays of 10000-string-arrays.
func testSet(seed int) [][]string {
	gen := &generator{
		src: rand.New(rand.NewSource(
			int64(seed),
		)),
	}
	set := make([][]string, 1000)
	for i := range set {
		strings := make([]string, 10000)
		for idx := range strings {
			// random length
			strings[idx] = gen.NextString()
		}
		set[i] = strings
	}
	return set
}

type generator struct {
	src *rand.Rand
}

func (g *generator) NextInt(max int) int {
	return g.src.Intn(max)
}

// Gets random random-length alphanumeric string.
func (g *generator) NextString() (str string) {
	// random-length 3-8 chars part
	strlen := g.src.Intn(6) + 3
	// random-length 1-3 num
	numlen := g.src.Intn(3) + 1
	// random position for num in string
	numpos := g.src.Intn(strlen + 1)

	var num string
	for i := 0; i < numlen; i++ {
		num += strconv.Itoa(g.src.Intn(10))
	}
	for i := 0; i < strlen+1; i++ {
		if i == numpos {
			str += num
		} else {
			str += string('a' + g.src.Intn(16))
		}
	}
	return str
}
