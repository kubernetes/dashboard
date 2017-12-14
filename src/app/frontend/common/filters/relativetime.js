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
 * Returns filter function to display relative time since given date.
 *
 * @param {!../appconfig/service.AppConfigService} kdAppConfigService
 * @return {function(string): string}
 * @ngInject
 */
export default function relativeTimeFilter(kdAppConfigService) {
  /**
   * Filter function to display relative time since given date.
   *
   * @param {string} value Filtered value.
   * @return {string}
   */
  let filterFunction = function(value) {
    if (value == null) {
      return TimeConstants.NOT_YET;
    }
    // Current server time.
    let serverTime = kdAppConfigService.getServerTime();

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
    if (diffInMilliseconds < -1000) {
      // Display NOT_YET only when diff is lower than -1000ms. To show NOW message for
      // times now() +- 1 second. This is because there may be a small desync in server time
      // computation.
      return TimeConstants.NOT_YET;
    } else if (diffInSeconds < 1) {
      return formatOutputTimeString_(0, Units.SECOND);
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

  return filterFunction;
}

/**
 * Returns current time. If appConfig.serverTime is provided then it will be returned, otherwise
 * current
 * client time will be used.
 *
 * @param {?Date} serverTime
 * @return {number}
 * @private
 */
function getCurrentTime(serverTime) {
  return serverTime ? serverTime.getTime() : (new Date()).getTime();
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
  if (timeValue > 1 || timeValue === 0) {
    return `${timeValue} ${timeUnit[1]}`;
  } else {
    return timeUnit[0];
  }
}

const i18n = {
  /** @export {string} @desc Time units label, a single second.*/
  MSG_TIME_UNIT_SECOND_LABEL: goog.getMsg('a second'),
  /** @export {string} @desc Time units label, many seconds (plural).*/
  MSG_TIME_UNIT_SECONDS_LABEL: goog.getMsg('seconds'),
  /** @export {string} @desc Time units label, a single minute.*/
  MSG_TIME_UNIT_MINUTE_LABEL: goog.getMsg('a minute'),
  /** @export {string} @desc Time units label, many minutes (plural).*/
  MSG_TIME_UNIT_MINUTES_LABEL: goog.getMsg('minutes'),
  /** @export {string} @desc Time units label, a single hour.*/
  MSG_TIME_UNIT_HOUR_LABEL: goog.getMsg('an hour'),
  /** @export {string} @desc Time units label, many hours (plural).*/
  MSG_TIME_UNIT_HOURS_LABEL: goog.getMsg('hours'),
  /** @export {string} @desc Time units label, a single day.*/
  MSG_TIME_UNIT_DAY_LABEL: goog.getMsg('a day'),
  /** @export {string} @desc Time units label, many days (plural).*/
  MSG_TIME_UNIT_DAYS_LABEL: goog.getMsg('days'),
  /** @export {string} @desc Time units label, a single month.*/
  MSG_TIME_UNIT_MONTH_LABEL: goog.getMsg('a month'),
  /** @export {string} @desc Time units label, many months (plural).*/
  MSG_TIME_UNIT_MONTHS_LABEL: goog.getMsg('months'),
  /** @export {string} @desc Time units label, a single year.*/
  MSG_TIME_UNIT_YEAR_LABEL: goog.getMsg('a year'),
  /** @export {string} @desc Time units label, many years (plural).*/
  MSG_TIME_UNIT_YEARS_LABEL: goog.getMsg('years'),
  /** @export {string} @desc Label for relative time that did not happened yet.*/
  MSG_TIME_NOT_YET_LABEL: goog.getMsg(`-`),
};

/**
 * Unit name constants (singular and plural form), that will be used by the filter.
 *
 * @enum {!Array<string>}
 */
const Units = {
  SECOND: [i18n.MSG_TIME_UNIT_SECOND_LABEL, i18n.MSG_TIME_UNIT_SECONDS_LABEL],
  MINUTE: [i18n.MSG_TIME_UNIT_MINUTE_LABEL, i18n.MSG_TIME_UNIT_MINUTES_LABEL],
  HOUR: [i18n.MSG_TIME_UNIT_HOUR_LABEL, i18n.MSG_TIME_UNIT_HOURS_LABEL],
  DAY: [i18n.MSG_TIME_UNIT_DAY_LABEL, i18n.MSG_TIME_UNIT_DAYS_LABEL],
  MONTH: [i18n.MSG_TIME_UNIT_MONTH_LABEL, i18n.MSG_TIME_UNIT_MONTHS_LABEL],
  YEAR: [i18n.MSG_TIME_UNIT_YEAR_LABEL, i18n.MSG_TIME_UNIT_YEARS_LABEL],
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
  NOT_YET: i18n.MSG_TIME_NOT_YET_LABEL,
};
