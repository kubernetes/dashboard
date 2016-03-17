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
 * Unit name constants (singular and plural form), that will be used by the filter.
 *
 * @enum {!Array<string>}
 */
const Units = {
  SECOND: ['a second', 'seconds'],
  MINUTE: ['a minute', 'minutes'],
  HOUR: ['an hour', 'hours'],
  DAY: ['a day', 'days'],
  MONTH: ['a month', 'months'],
  YEAR: ['a year', 'years'],
};

/**
 * Unit conversion constants.
 *
 * @enum {number}
 */
const UnitConversions = {
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  DAYS_PER_MONTH: 30,
  DAYS_PER_YEAR: 365,
  MONTHS_PER_YEAR: 12,
};

/**
 * Time constants.
 *
 * @enum {string}
 */
const TimeConstants = {
  NOT_YET: `didn't happen yet`,
  NOW: `just now`,
};

/**
 * Returns filter function to display relative time since given date.
 *
 * @return {function(string, ?string): string}
 */
export default function relativeTimeFilter(appConfig) {
  /**
   * Filter function to display relative time since given date.
   *
   * @param {string} value Filtered value.
   * @param {?string} serverTime Current server time, if not provided then client time will be used.
   * @return {string}
   */
  let filterFunction = function(value, serverTime) {
    // Current and given times in miliseconds.
    let currentTime = getCurrentTime(serverTime);
    let givenTime = (new Date(value)).getTime();

    // Time differences between current time and given time in specific units.
    let diffInMilliseconds = currentTime - givenTime;
    let diffInSeconds = Math.floor(diffInMilliseconds / UnitConversions.MILLISECONDS_PER_SECOND);
    let diffInMinutes = Math.floor(diffInSeconds / UnitConversions.SECONDS_PER_MINUTE);
    let diffInHours = Math.floor(diffInMinutes / UnitConversions.MINUTES_PER_HOUR);
    let diffInDays = Math.floor(diffInHours / UnitConversions.HOURS_PER_DAY);
    let diffInMonths = Math.floor(diffInDays / UnitConversions.DAYS_PER_MONTH);
    let diffInYears = Math.floor(diffInDays / UnitConversions.DAYS_PER_YEAR);

    // Returns relative time value. Only biggest unit will be taken into consideration, so if time
    // difference is 2 days and 15 hours, only '2 days' string will be returned.
    if (diffInMilliseconds < 0) {
      return TimeConstants.NOT_YET;
    } else if (diffInSeconds < 1) {
      return TimeConstants.NOW;
    } else if (diffInMinutes < 1) {
      return formatOutputTimeString_(diffInSeconds, Units.SECOND);
    } else if (diffInHours < 1) {
      return formatOutputTimeString_(diffInMinutes, Units.MINUTE);
    } else if (diffInDays < 1) {
      return formatOutputTimeString_(diffInHours, Units.HOUR);
    } else if (diffInMonths < 1) {
      return formatOutputTimeString_(diffInDays, Units.DAY);
    } else if (diffInYears < 1) {
      return formatOutputTimeString_(diffInMonths, Units.MONTH);
    } else {
      return formatOutputTimeString_(diffInYears, Units.YEAR);
    }
  };

  let isWaiting = false;
  let currentServerTime = null;
  return function filterHandler(input) {
    // Use local time as default before server time will be resolved.
    // TODO(maciaszczykm): Avoid it and handle state changes (filterHandler.$stateful = true?).
    // TODO(maciaszczykm): Architecture and tests.
    let output = filterFunction(input, null);
    if (currentServerTime) {
      output = filterFunction(input, currentServerTime);
    } else {
      if (isWaiting === false) {
        isWaiting = true;
        appConfig.getCurrentServerTime().then(function(result) {
          currentServerTime = result.currentTime;
          isWaiting = false;
        });
      }
    }
    return output;
  };
}

/**
 * Returns current time. If currentServerTime is provided then it will be parsed, otherwise current
 * client time will be used.
 *
 * @param currentServerTime
 * @return {number}
 * @private
 */
function getCurrentTime(currentServerTime) {
  if (currentServerTime) {
    return (new Date(currentServerTime)).getTime();
  } else {
    return (new Date()).getTime();
  }
}

/**
 * Formats relative time string. Sample results look following: 'a year', '2 days' or '14 hours'.
 *
 * @param {number} timeValue Time value in specified unit.
 * @param {!Array<string>} timeUnit Specified unit.
 * @return {string} Formatted time string.
 * @private
 */
function formatOutputTimeString_(timeValue, timeUnit) {
  if (timeValue > 1) {
    return `${timeValue} ${timeUnit[1]}`;
  } else {
    return timeUnit[0];
  }
}
