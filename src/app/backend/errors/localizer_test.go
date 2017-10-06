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

package errors

import (
	"errors"
	"reflect"
	"testing"
)

func TestLocalizeError(t *testing.T) {
	cases := []struct {
		err      error
		expected error
	}{
		{
			nil,
			nil,
		},
		{
			errors.New("some unknown error"),
			errors.New("some unknown error"),
		},
		{
			errors.New("does not match the namespace"),
			errors.New("MSG_DEPLOY_NAMESPACE_MISMATCH_ERROR"),
		},
		{
			errors.New("empty namespace may not be set"),
			errors.New("MSG_DEPLOY_EMPTY_NAMESPACE_ERROR"),
		},
	}
	for _, c := range cases {
		actual := LocalizeError(c.err)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("LocalizeError(%+v) == %+v, expected %+v", c.err, actual, c.expected)
		}
	}
}
