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

/**
 * Name of the namespace state. This state should be used as a parent state for all root states.
 * It provides gobal namespace option for all URLs.
 */
export const stateName = 'chrome';

/**
 * Name of the action bar view. Action bar is the second toolbar in the application and can
 * be used for, e.g., breadcrumbs or view-specific action buttons.
 */
export const actionbarViewName = 'actionbar';

/**
 * Parameter name of the namespace selection param. Mostly for internal use.
 */
export const namespaceParam = 'namespace';

/**
 * To be used in data section in params. Set to true for views that should fill app content.
 *
 * Defaults to false.
 */
export const fillContentConfig = 'fillContent';

/**
 * To be used with states that can only be accessed after user has been authenticated.
 *
 * Defaults to true.
 */
export const authRequired = 'authRequired';

/**
 * All properties are @exported and in sync with URL param names.
 */
export class StateParams {
  /**
   * @param {string|undefined} namespace
   */
  constructor(namespace) {
    /** @export {string|undefined} */
    this.namespace = namespace;
  }
}
