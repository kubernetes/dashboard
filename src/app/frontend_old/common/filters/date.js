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
 * Returns filter function to display date in the default format
 *
 * @param {function(string, string, string):string} $delegate
 * @return {function(string,string,string): string}
 * @ngInject
 */
export default function dateFilter($delegate) {
  let original = $delegate;
  const defaultFormat = 'yyyy-MM-ddTHH:mm';
  const defaultTZ = 'UTC';
  /**
   * If no format or TZ are given use the default ones.
   *
   * @param {string} date
   * @param {string} format
   * @param {string} timezone
   * @return {string}
   */
  let filterFunction = function(date, format, timezone) {
    if (!timezone) {
      timezone = defaultTZ;
    }
    if (!format) {
      if (timezone === defaultTZ) {
        format = `${defaultFormat} UTC`;
      } else {
        format = defaultFormat;
      }
    }
    return original(date, format, timezone);
  };

  return filterFunction;
}
