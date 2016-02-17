// Copyright 2015 Google Inc. All Rights Reserved.
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

package main

import (
	"testing"
)

func TestNormalizeHostname(t *testing.T) {
	cases := []struct {
		host     Hostname
		expected string
	}{
		{Hostname("/"), ""},
		{Hostname("/"), ""},
		{Hostname("\\a"), "/a"},
		{Hostname("//a"), "//a"},
		{Hostname("/a"), "/a"},
		{Hostname("http://localhost:8080/"), "http://localhost:8080"},
		{Hostname("http://localhost:8080//"), "http://localhost:8080"},
		{Hostname("http://localhost:8080//\\/\\"), "http://localhost:8080"},
		{Hostname("http://localhost:8080//\\////\\/"), "http://localhost:8080"},
		{Hostname("http:\\localhost:8080//\\////\\/"), "http:/localhost:8080"},
		{Hostname("http:\\\\localhost:8080//\\////\\/"), "http://localhost:8080"},
		{Hostname("http:\\\\localhost:8080//\\////\\/"), "http://localhost:8080"},
		{Hostname("http:\\\\localhost:\\8080//\\////\\/"), "http://localhost:/8080"},
	}

	for _, c := range cases {
		actual := c.host.normalize()
		if c.expected != actual {
			t.Errorf("Normalize() == %#v, expected %#v", actual, c.expected)
		}
	}
}
