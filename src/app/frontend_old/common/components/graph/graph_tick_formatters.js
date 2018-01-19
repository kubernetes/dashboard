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

import coresFilter from '../../filters/cores';
import memoryFilter from '../../filters/memory';

/**
 * Formats the number to contain ideally 3 significant figures, but reduces the number of
 * significant figures for small numbers in order to keep the number of decimal places down to 3. So
 * for numbers below 0.01 number of significant figures will be 1.
 * @param {number} d
 * @return {string}
 * @private
 */
function precisionFilter(d) {
  if (d >= 1000) {
    return d3.format(',')(d.toPrecision(3));
  }
  if (d < 0.01) {
    return d.toPrecision(1);
  } else if (d < 0.1) {
    return d.toPrecision(2);
  }
  return d.toPrecision(3);
}

/**
 * Returns formatted memory usage value.
 * @param {number} d
 * @return {string}
 */
export function formatMemoryUsage(d) {
  return d === null ? i18n.MSG_GRAPH_DATA_POINT_NOT_AVAILABLE : memoryFilter(precisionFilter)(d);
}

/**
 * Returns formatted CPU usage value.
 * @param {number} d
 * @return {string}
 */
export function formatCpuUsage(d) {
  return d === null ? i18n.MSG_GRAPH_DATA_POINT_NOT_AVAILABLE : coresFilter(precisionFilter)(d);
}

/**
 * Returns formatted time.
 * @param {number} d
 * @return {string}
 */
export function formatTime(d) {
  return d3.time.format('%H:%M')(new Date(1000 * d));
}

const i18n = {
  /** @export {string} @desc String to display when data point is not available. */
  MSG_GRAPH_DATA_POINT_NOT_AVAILABLE: goog.getMsg('N/A'),
};
