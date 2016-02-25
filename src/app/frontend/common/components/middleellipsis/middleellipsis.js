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
 * @param {!Element} container - outer element contains 'element'. Its role is to be bounding
 * box of inner element.
 * @param {!Element} element - inner element of document that contains text to be trimmed
 * @param {!function(string, number): string} filter - middle ellipsis filter function used to
 * truncate string
 * @param {string} displayString - original display string (not truncated)
 *
 * @return {number}
 */
export default function computeTextLength(container, element, filter, displayString) {
  let availableWidth = container.offsetWidth;
  // Browsers are using floating numbers and element returns integer.
  // Reduce by 1px in case of rounding problem.
  let width = element.offsetWidth - 1;

  // If it already fits then do not change
  if (availableWidth >= width) {
    return element.textContent.length;
  }

  return binarySearchLength(availableWidth, element, filter, displayString);
}

/**
 * Does binary search to find minimal integer I such that given string with length I fits into
 * available space and with length I + 1 it does not.
 *
 * @param {number} availableWidth - width to which length of text should be scaled to
 * @param {!Element} element - element with text that should be truncated to fit available width
 * @param {!function(string, number): string} filter - filter function used to truncate string
 * @param {string} displayString - original display string (not truncated)
 *
 * @return {number}
 */
export function binarySearchLength(availableWidth, element, filter, displayString) {
  let [left, right] = [0, displayString.length];
  let [width, length] = [0, 0];

  while (left <= right) {
    length = Math.ceil((left + right) / 2);

    element.textContent = filter(displayString, length);
    width = element.offsetWidth;

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

  return length;
}
