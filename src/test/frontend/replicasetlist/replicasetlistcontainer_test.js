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

import {binarySearchOptimalHeight} from 'replicasetlist/replicasetlistcontainer';

describe('Replica set list container', () => {

  it('should compute optimal height', () => {
    let testData = [
      // The format is: [heights array, num columns, expected result].
      [[], 0, 0],
      [[], 1, 0],
      [[], 2321, 0],
      [[1], 0, 1],
      [[1], 1, 1],
      [[1], 2321, 1],
      [[2321], 1, 2321],
      [[2321], 2321, 2321],
      [[1, 1], 1, 2],
      [[1, 1], 2, 1],
      [[1, 2, 5, 8, 1, 3, 6, 2, 3], 1, 31],
      [[1, 2, 5, 8, 1, 3, 6, 2, 3], 2, 16],
      [[1, 2, 5, 8, 1, 3, 6, 2, 3], 3, 12],
      [[1, 2, 5, 8, 1, 3, 6, 2, 3], 4, 9],
      [[1, 2, 5, 8, 1, 3, 6, 2, 3], 5, 8],
      [[1, 2, 5, 8, 1, 3, 6, 2, 3], 10, 8],
      [[1, 2, 5, 8, 1, 3, 6, 2, 3], 2321, 8],
      // Below test data is based on real examples.
      [[237, 237, 197, 197, 197, 197, 197, 251, 204, 237, 246, 204, 197, 211, 232, 211], 8, 474],
      [[237, 237, 197, 197, 197, 197, 197, 251, 204, 237, 246, 204, 197, 211, 232, 211], 7, 612],
      [[237, 237, 197, 197, 197, 197, 197, 251, 204, 237, 246, 204, 197, 211, 232, 211], 6, 654],
      [[237, 237, 197, 197, 197, 197, 197, 251, 204, 237, 246, 204, 197, 211, 232, 211], 5, 788],
      [[237, 237, 197, 197, 197, 197, 197, 251, 204, 237, 246, 204, 197, 211, 232, 211], 4, 891],
      [[237, 237, 197, 197, 197, 197, 197, 251, 204, 237, 246, 204, 197, 211, 232, 211], 3, 1262],
      [[237, 237, 197, 197, 197, 197, 197, 251, 204, 237, 246, 204, 197, 211, 232, 211], 2, 1742],
      [[237, 237, 197, 197, 197, 197, 197, 251, 204, 237, 246, 204, 197, 211, 232, 211], 1, 3452],
      [[237, 237, 197, 197, 197, 197, 197, 251, 204, 237, 246, 204, 197, 211, 232, 211], 0, 3452],

      [[237, 237, 197, 197, 197, 197, 10000, 204, 237, 246, 204, 197, 211, 232, 211], 10, 10000],
      [[237, 237, 197, 197, 197, 197, 10000, 204, 237, 246, 204, 197, 211, 232, 211], 5, 10000],
      [[237, 237, 197, 197, 197, 197, 10000, 204, 237, 246, 204, 197, 211, 232, 211], 3, 10000],
      [[237, 237, 197, 197, 197, 197, 10000, 204, 237, 246, 204, 197, 211, 232, 211], 2, 11262],
      [[237, 237, 197, 197, 197, 197, 10000, 204, 237, 246, 204, 197, 211, 232, 211], 1, 13004],
      [[237, 237, 197, 197, 197, 197, 10000, 204, 237, 246, 204, 197, 211, 232, 211], 0, 13004],
    ];

    for (let [heights, numColumns, expected] of testData) {
      let actual = binarySearchOptimalHeight(heights, numColumns);
      expect(actual).toBe(
          expected, `Expected height to be ${expected} but was ${actual}. ` +
              `Required number of columns: ${numColumns}, heights: [${heights}]`);
    }
  });
});
