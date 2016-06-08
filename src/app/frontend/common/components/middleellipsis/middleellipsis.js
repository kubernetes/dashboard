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
 * Based on given container and its width calculates maximum text length.
 * Filter is used to truncate string until binary search finds optimal length to use
 * available space.
 *
 * Container is outer element of 'element' and is used as bounding box to allow stretching of
 * inner element and not exceed boundaries of outer container. It's the best to style container
 * with display: [block|inline-block] and width: 100% and disable text wrapping for the element.
 *
 * @param {number} availableWidth - the width of outer container element that is available
 *     for filling content into
 * @param {!Element} element - element that content text will be added to
 * @param {!Element} measurementElement - element that width will be measured when ellipsing
 *     the text
 * @param {!function(string, number): string} filter - middle ellipsis filter function used to
 *     truncate string
 * @param {string} displayString - original display string (not truncated)
 * @return {number}
 */
export default function computeTextLength(
    availableWidth, element, measurementElement, filter, displayString) {
  // Does binary search to find minimal integer I such that given string with length I fits into
  // available space and with length I + 1 it does not.
  // Make right displayString.length * 2 to start binary search with max length, which should be
  // most common case.
  let [left, right] = [0, displayString.length * 2];
  let [width, length] = [0, 0];

  while (left <= right) {
    length = Math.ceil((left + right) / 2);

    element.textContent = filter(displayString, length);
    width = measurementElement.offsetWidth;

    if (width < availableWidth) {
      left = length + 1;
    } else if (width > availableWidth) {
      right = length - 1;
    } else {
      break;
    }

    if (left > right && width > availableWidth && length > 0) {
      element.textContent = filter(displayString, --length);
    }
  }

  return Math.min(length, displayString.length);
}
