:exclamation: WARNING: 13x slower than https://github.com/fvbommel/util/tree/master/sortorder

## Handysort [![Build Status](https://drone.io/github.com/xlab/handysort/status.png)](https://drone.io/github.com/xlab/handysort/latest) [![GoDoc](https://godoc.org/github.com/xlab/handysort?status.svg)](https://godoc.org/github.com/xlab/handysort)

This is a Go package implementing a correct comparison function
to compare alphanumeric strings with respect to their integer parts.

For example, this is default result of strings sort:

	hello1
	hello10
	hello11
	hello2
	hello3

This is handysort:

	hello1
	hello2
	hello3
	hello10
	hello11

However, this is about 5x-8x times slower than the default sort version.
(benchmarks available)

### Usage

```Go
package main

import (
	"github.com/xlab/handysort"
	"sort"
)

func main() {
	s1, s2 := "hello2", "hello10"
	// instead of s1 < s2
	less := handysort.StringLess(s1, s2)

	s := []string{"hello5", "hello10", "hello1"}
	// instead of sort.Strings
	sort.Sort(handysort.Strings(s))
}
```

### Benchmarking

```
$ go test -bench=.
```
