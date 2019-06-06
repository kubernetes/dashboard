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

package errors_test

import (
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/errors"
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
			errors.NewInternal("some unknown error"),
			errors.NewInternal("some unknown error"),
		},
		{
			errors.NewInvalid("does not match the namespace"),
			errors.NewInvalid("MSG_DEPLOY_NAMESPACE_MISMATCH_ERROR"),
		},
		{
			errors.NewInvalid("empty namespace may not be set"),
			errors.NewInvalid("MSG_DEPLOY_EMPTY_NAMESPACE_ERROR"),
		},
	}
	for _, c := range cases {
		actual := errors.LocalizeError(c.err)
		if !areErrorsEqual(actual, c.expected) {
			t.Errorf("LocalizeError(%+v) == %+v, expected %+v", c.err, actual, c.expected)
		}
	}
}

func areErrorsEqual(err1, err2 error) bool {
	return (err1 != nil && err2 != nil && err1.Error() == err2.Error()) ||
		(err1 == nil && err2 == nil)
}
