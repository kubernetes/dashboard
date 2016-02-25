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

/**
 * Returns filter function to apply middle ellipsis when string is longer then max parameter.
 * @return {function(string, number): string}
 */
export default function middleEllipsisFilter() {
  /**
   * Filter function to apply middle ellipsis when string is longer then max parameter.
   * @param {string} value Filtered value.
   * @param {number} limit Length limit for filtered value.
   * @return {string}
   */
  let filterFunction = function(value, limit) {
    limit = parseInt(limit, 10);
    if (!limit) return value;
    if (!value) return value;
    if (value.length <= limit) return value;
    if (limit === 1) return `${value[0]}...`;

    /**
     * Begin part of truncated text.
     * @type {number}
     */
    let beginPartIndex = Math.floor(limit / 2 + limit % 2);
    /**
     * End part of truncated text.
     * @type {number}
     */
    let endPartIndex = -Math.floor(limit / 2);

    let begin = value.substring(0, beginPartIndex);
    let end = value.slice(endPartIndex);
    return `${begin}...${end}`;
  };
  return filterFunction;
}
