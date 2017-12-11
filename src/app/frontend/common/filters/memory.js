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

/** Base for binary prefixes */
const base = 1024;

/** Names of the suffixes where I-th name is for base^I suffix. */
const powerSuffixes = ['', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi'];

/**
 * Returns filter function that formats memory in bytes.
 * @param {function(number): string} numberFilter
 * @return {function(number): string}
 * @ngInject
 */
export default function memoryFilter(numberFilter) {
  /**
   * Formats memory in bytes to a binary prefix format, e.g., 789,21 MiB.
   * @param {number} value Value to be formatted.
   * @return {string}
   */
  let formatMemory = function(value) {
    let divider = 1;
    let power = 0;

    while (value / divider > base && power < powerSuffixes.length - 1) {
      divider *= base;
      power += 1;
    }
    let formatted = numberFilter(value / divider);
    let suffix = powerSuffixes[power];
    return suffix ? `${formatted} ${suffix}` : formatted;
  };

  return formatMemory;
}
