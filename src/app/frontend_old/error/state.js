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

import {StateParams as ChromeStateParams} from '../chrome/state';

/** Name of the state. Can be used in, e.g., $state.go method. */
export const stateName = 'internalerror';

/**
 * Parameters for this state.
 */
export class StateParams extends ChromeStateParams {
  /**
   * @param {!angular.$http.Response} error
   * @param {string} namespace
   */
  constructor(error, namespace) {
    super(namespace);

    /** @type {!angular.$http.Response} */
    this.error = error;
  }
}
