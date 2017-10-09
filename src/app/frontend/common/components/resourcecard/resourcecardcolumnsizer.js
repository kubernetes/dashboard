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

/** Possible values for grow param. */
const GROW_OPTIONS = ['nogrow', '1', '2', '4'];

/** Possible values for size param. */
const SIZE_OPTIONS = ['small', 'medium', 'large'];

/**
 * Sizes the given resource card column element based on its size and grow attributes.
 * @param {!angular.JQLite} element
 * @param {string|undefined} size
 * @param {string|undefined} grow
 */
export function size(element, size, grow) {
  if (!size) {
    // Medium is the default size.
    size = 'medium';
  }
  if (SIZE_OPTIONS.indexOf(size) >= 0) {
    element.addClass(`kd-column-size-${size}`);
  }

  if (!grow) {
    // 1 is the default.
    grow = '1';
  }
  if (GROW_OPTIONS.indexOf(grow) >= 0) {
    element.addClass(`kd-column-grow-${grow}`);
  }
}
