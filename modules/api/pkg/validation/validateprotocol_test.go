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

func TestValidateProtocol(t *testing.T) {
	cases := []struct {
		spec     *ProtocolValiditySpec
		expected bool
	}{
		{
			&ProtocolValiditySpec{
				Protocol:   "TCP",
				IsExternal: false,
			},
			true,
		},
		{
			&ProtocolValiditySpec{
				Protocol:   "UDP",
				IsExternal: true,
			},
			false,
		},
	}

	for _, c := range cases {
		validity := ValidateProtocol(c.spec)
		if validity.Valid != c.expected {
			t.Errorf("Expected %#v validity to be %#v, but was %#v\n",
				c.spec, c.expected, validity)
		}
	}
}
