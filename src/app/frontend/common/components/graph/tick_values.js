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

import {MAX_BETWEEN_TICKS, TICK_NUM} from './settings';

/**
 * @type {!Array<number>}
 */
const DIV_PRIORITY = [1500, 1000, 500, 250, 200, 100, 50, 25, 20, 10, 5, 1];

/**
 * Returns a nice looking number between a and b. Nice number means - has fewest number of non zero
 * significant digits, and preferably last significant digit equal to 0, 5 or 2, in this priority
 * order. Designed to work as long as b is no more than 2 times larger than a and checks up to 3
 * significant digits.
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
function niceNum(a, b) {
  let ra = b / a;
  let sh = Math.floor(Math.log(a) / Math.log(10));
  let pa = a * Math.pow(10, -sh) * 100;
  let pb = Math.floor(pa * ra);
  pa = Math.ceil(pa);
  for (let i = 0; i < DIV_PRIORITY.length; i++) {
    let cand = DIV_PRIORITY[i];
    if (Math.ceil(pa / cand) <= Math.floor(pb / cand)) {
      return Math.ceil(pa / cand) * cand / 100 * Math.pow(10, sh);
    }
  }
  return a;
}

/**
 * Returns a nice looking number between a and b.
 * @param {number} yMax
 * @return {number}
 */
function getYTickSeparation(yMax) {
  return niceNum(yMax / MAX_BETWEEN_TICKS[1], yMax / MAX_BETWEEN_TICKS[0]);
}

/**
 * Returns optimal value of max.
 * @param {number} yMax
 * @return {number}
 */
export function getNewMax(yMax) {
  return getYTickSeparation(yMax) * TICK_NUM;
}

/**
 * Returns tick value for a given max value.
 * @param {number} yMax
 * @return {!Array<number>}
 */
export function getTickValues(yMax) {
  let ticks = [];
  let yTickSep = getYTickSeparation(yMax);
  for (let i = 1; i <= Math.ceil(TICK_NUM - 1); i++) {
    ticks.push(yTickSep * i);
  }
  return ticks;
}
