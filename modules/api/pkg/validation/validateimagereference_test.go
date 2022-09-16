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

package validation

import "testing"

func TestValidateImageReference(t *testing.T) {
	cases := []struct {
		reference string
		expected  bool
	}{
		{
			"test",
			true,
		},
		{
			"test:1",
			true,
		},
		{
			"test:tag",
			true,
		},
		{
			"private.registry:5000/test:1",
			true,
		},
		{
			"private.registry:5000/test",
			true,
		},
		{
			"private.registry:5000/namespace/test:1",
			true,
		},
		{
			"private.registry:port/namespace/test:1",
			false,
		},
		{
			"private.registry:5000/n/a/m/e/s/test:1",
			true,
		},
		{
			"private.registry:5000/namespace/test:image:1",
			false,
		},
		{
			":",
			false,
		},
		{
			"private.registry:5000/test:1@sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
			true,
		},
		{
			"Test",
			false,
		},
		{
			"private.registry:5000/Test",
			false,
		},
		{
			"private@registry:5000/test",
			false,
		},
		{
			"",
			false,
		},
		{
			"test image:1",
			false,
		},
	}

	for _, c := range cases {
		spec := &ImageReferenceValiditySpec{
			Reference: c.reference,
		}
		validity, _ := ValidateImageReference(spec)
		if validity.Valid != c.expected {
			t.Errorf("Expected %#v validity to be %#v, but was %#v\n",
				c.reference, c.expected, validity)
		}
	}
}
