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
 * Computes optimal height of the given container that will fit all its child elements into N
 * column layout. N is based on current media query from the $mdMedia service.
 *
 * @param {!Element} container Container element that has child elements to be arranged in columns.
 *     It should be a flexbox container with columns wrapped.
 * @param {function(string):boolean} mdMedia Angular Material $mdMedia service
 * @return {number}
 */
export default function computeContainerHeight(container, mdMedia) {
  /** @type {!Array<number>} */
  let childHeights = Array.prototype.map.call(container.children, (child) => child.offsetHeight);

  let columnCount = computeColumnCount(mdMedia);
  return binarySearchOptimalHeight(childHeights, columnCount);
}

/**
 * Returns optimal number of columns for current window size.
 *
 * @param {function(string):boolean} mdMedia Angular Material $mdMedia service
 * @return {number}
 */
function computeColumnCount(mdMedia) {
  if (mdMedia('gt-md')) {
    return 3;
  } else if (mdMedia('md')) {
    return 2;
  } else {
    return 1;
  }
}

/**
 * Does binary search to find minimal integer I such that with height I elements fit into numColumns
 * and with height I - 1 they do not.
 *
 * @param {!Array<number>} heights
 * @param {number} numColumns
 * @return {number}
 */
export function binarySearchOptimalHeight(heights, numColumns) {
  let sum = Math.ceil(heights.reduce((a, b) => a + b, 0));
  let height = 0;

  let left = 0;
  let right = sum;
  for (;;) {
    height = Math.floor((left + right) / 2);
    let [leftChunks, rightChunks] = getActualColumnCount(heights, height - 1, height);

    if ((leftChunks > numColumns && rightChunks <= numColumns) || (left === right)) {
      break;
    } else if (leftChunks > numColumns) {
      left = height + 1;
    } else {
      right = height;
    }
  }

  return height;
}

/**
 * Returns actual column count for the given array of element heights and two actual heights.
 * Two values are returned, first for leftHeight and the other for rightHeight. Infinity is
 * returned if for any height (left of right) there is an item that does not fit it.
 *
 * @param {!Array<number>} heights
 * @param {number} leftHeight
 * @param {number} rightHeight
 * @return {!Array<number>}
 */
function getActualColumnCount(heights, leftHeight, rightHeight) {
  let sizeLeftChunks = 0;
  let currentLeftHeight = 0;

  let doesNotFitLeftHeight = false;
  let doesNotFitRightHeight = false;

  let sizeRightChunks = 0;
  let currentRightHeight = 0;
  for (let item of heights) {
    if (item > leftHeight) {
      doesNotFitLeftHeight = true;
    }
    if (item > rightHeight) {
      doesNotFitRightHeight = true;
    }

    if (currentLeftHeight + item > leftHeight) {
      currentLeftHeight = item;
      sizeLeftChunks += 1;
    } else {
      currentLeftHeight += item;
    }

    if (currentRightHeight + item > rightHeight) {
      currentRightHeight = item;
      sizeRightChunks += 1;
    } else {
      currentRightHeight += item;
    }
  }
  if (currentLeftHeight !== 0) {
    sizeLeftChunks += 1;
  }
  if (currentRightHeight !== 0) {
    sizeRightChunks += 1;
  }
  if (doesNotFitLeftHeight) {
    sizeLeftChunks = Number.POSITIVE_INFINITY;
  }
  if (doesNotFitRightHeight) {
    sizeRightChunks = Number.POSITIVE_INFINITY;
  }
  return [sizeLeftChunks, sizeRightChunks];
}
