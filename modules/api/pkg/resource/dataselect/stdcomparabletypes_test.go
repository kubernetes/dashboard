// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package dataselect

import (
	"reflect"
	"testing"
	"time"
)

func TestIntsCompare(t *testing.T) {
	cases := []struct {
		a, b, expected int
	}{
		{
			5, 1, 1,
		},
		{
			5, 5, 0,
		},
		{
			1, 3, -1,
		},
	}
	for _, c := range cases {
		actual := intsCompare(c.a, c.b)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("intsCompare(%+v, %+v) == %+v, expected %+v", c.a, c.b, actual, c.expected)
		}
	}
}

func TestInts64Compare(t *testing.T) {
	cases := []struct {
		a, b     int64
		expected int
	}{
		{
			5, 1, 1,
		},
		{
			5, 5, 0,
		},
		{
			1, 3, -1,
		},
	}
	for _, c := range cases {
		actual := ints64Compare(c.a, c.b)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("ints64Compare(%+v, %+v) == %+v, expected %+v", c.a, c.b, actual, c.expected)
		}
	}
}

func TestStdComparableTimeContains(t *testing.T) {
	now := time.Now()
	future := now.Add(894718949849)
	cases := []struct {
		a, b     ComparableValue
		expected bool
	}{
		{
			StdComparableTime(now),
			StdComparableTime(now),
			true,
		},
		{
			StdComparableTime(now),
			StdComparableTime(future),
			false,
		},
	}
	for _, c := range cases {
		actual := c.a.Contains(c.b)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("Contains(%+v) == %+v, expected %+v", c.b, actual, c.expected)
		}
	}
}

func TestStdComparableIntContains(t *testing.T) {
	cases := []struct {
		a, b     StdComparableInt
		expected bool
	}{
		{
			StdComparableInt(3),
			StdComparableInt(3),
			true,
		},
		{
			StdComparableInt(1),
			StdComparableInt(3),
			false,
		},
	}
	for _, c := range cases {
		actual := c.a.Contains(c.b)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("Contains(%+v) == %+v, expected %+v", c.b, actual, c.expected)
		}
	}
}

func TestStdComparableStringContains(t *testing.T) {
	cases := []struct {
		a, b     StdComparableString
		expected bool
	}{
		{
			StdComparableString("abc"),
			StdComparableString("abc"),
			true,
		},
		{
			StdComparableString("abc"),
			StdComparableString("xyz"),
			false,
		},
	}
	for _, c := range cases {
		actual := c.a.Contains(c.b)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("Contains(%+v) == %+v, expected %+v", c.b, actual, c.expected)
		}
	}
}

func TestStdComparableRFC3339Timestamp(t *testing.T) {
	cases := []struct {
		a, b     StdComparableRFC3339Timestamp
		expected bool
	}{
		{
			StdComparableRFC3339Timestamp("2011-08-30T13:22:53.108Z"),
			StdComparableRFC3339Timestamp("2011-08-30T13:22:53.108Z"),
			true,
		},
		{
			StdComparableRFC3339Timestamp("2011-08-30T13:22:53.108Z"),
			StdComparableRFC3339Timestamp("2018-08-30T13:22:53.108Z"),
			false,
		},
	}
	for _, c := range cases {
		actual := c.a.Contains(c.b)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("Contains(%+v) == %+v, expected %+v", c.b, actual, c.expected)
		}
	}
}
