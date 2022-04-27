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
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/errors"
)

func TestHandleHTTPError(t *testing.T) {
	cases := []struct {
		err      error
		expected int
	}{
		{
			nil,
			500,
		},
		{
			errors.NewInvalid("some unknown error"),
			500,
		},
		{
			errors.NewInvalid(errors.MsgDeployNamespaceMismatchError),
			500,
		},
		{
			errors.NewInvalid(errors.MsgLoginUnauthorizedError),
			401,
		},
		{
			errors.NewInvalid(errors.MsgTokenExpiredError),
			401,
		},
		{
			errors.NewInvalid(errors.MsgEncryptionKeyChanged),
			401,
		},
	}
	for _, c := range cases {
		actual := errors.HandleHTTPError(c.err)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("HandleHTTPError(%+v) == %+v, expected %+v", c.err, actual, c.expected)
		}
	}
}
