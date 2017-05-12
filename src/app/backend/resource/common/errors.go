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

package common

import (
	"errors"
	"strings"
)

// This file contains all errors that should be kept in sync with:
// 'src/app/frontend/common/errorhandling/errors.js' and localized on frontend side.
//
// Map structure:
// Key - unique partial string that can be used to differentiate error messages
// Value - unique error code string that frontend can use to localize error message created using
// 		   pattern MSG_<VIEW>_<CAUSE_OF_ERROR>_ERROR
var partialsToErrorsMap = map[string]string{
	"does not match the namespace":   "MSG_DEPLOY_NAMESPACE_MISMATCH_ERROR",
	"empty namespace may not be set": "MSG_DEPLOY_EMPTY_NAMESPACE_ERROR",
}

// LocalizeError returns error code (string) that can be used by frontend to localize error message.
func LocalizeError(err error) error {
	if err == nil {
		return nil
	}

	for partial, errString := range partialsToErrorsMap {
		if strings.Contains(err.Error(), partial) {
			return errors.New(errString)
		}
	}

	return err
}
