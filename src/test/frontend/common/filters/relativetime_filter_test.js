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

import filtersModule from 'common/filters/module';

describe('Relative time filter', () => {

  /**
   * Current time mock.
   * @type {Date}
   */
  const currentTime = new Date(
      2015,  // year
      11,    // month
      29,    // day
      23,    // hour
      59,    // minute
      59     // second
  );

  /** @type {function(!Date):string} */
  let relativeTimeFilter;
  /** @type {!Date} */
  let givenTime;

  beforeEach(() => {
    jasmine.clock().mockDate(currentTime);
    angular.mock.module(filtersModule.name);
    angular.mock.inject((_relativeTimeFilter_) => {
      relativeTimeFilter = _relativeTimeFilter_;
    });

    givenTime = new Date(currentTime);
  });

  it(`should return 'didn't happen yet' string if given time is (a year ahead) in the future`,
     () => {
       // given
       givenTime.setYear(givenTime.getFullYear() + 1);

       // when
       let relativeTime = relativeTimeFilter(givenTime);

       // then
       expect(relativeTime).toEqual(`-`);
     });

  it('should return 0s string if given time is the same as current time', () => {
    // when
    let relativeTime = relativeTimeFilter(givenTime);

    // then
    expect(relativeTime).toEqual('0 seconds');
  });

  it('should return 0s string if given time is up to 1s before current time', () => {
    expect(relativeTimeFilter(new Date(currentTime.getTime() + 1000))).toEqual('0 seconds');
    expect(relativeTimeFilter(new Date(currentTime.getTime() + 2000))).toEqual('-');
  });

  it('should return \'a second\' string if given time is a second before current time', () => {
    // given
    givenTime.setSeconds(givenTime.getSeconds() - 1);

    // when
    let relativeTime = relativeTimeFilter(givenTime);

    // then
    expect(relativeTime).toEqual('a second');
  });

  it('should return \'15 seconds\' string if given time is 15 seconds before current time', () => {
    // given
    givenTime.setSeconds(givenTime.getSeconds() - 15);

    // when
    let relativeTime = relativeTimeFilter(givenTime);

    // then
    expect(relativeTime).toEqual('15 seconds');
  });

  it('should return \'a minute\' string if given time is a minute before current time', () => {
    // given
    givenTime.setMinutes(givenTime.getMinutes() - 1);

    // when
    let relativeTime = relativeTimeFilter(givenTime);

    // then
    expect(relativeTime).toEqual('a minute');
  });

  it('should return \'30 minutes\' string if given time is 30 minutes before current time', () => {
    // given
    givenTime.setMinutes(givenTime.getMinutes() - 30);

    // when
    let relativeTime = relativeTimeFilter(givenTime);

    // then
    expect(relativeTime).toEqual('30 minutes');
  });

  it('should return \'an hour\' string if given time is an hour before current time', () => {
    // given
    givenTime.setHours(givenTime.getHours() - 1);

    // when
    let relativeTime = relativeTimeFilter(givenTime);

    // then
    expect(relativeTime).toEqual('an hour');
  });

  it('should return \'3 hours\' string if given time is 3 hours before current time', () => {
    // given
    givenTime.setHours(givenTime.getHours() - 3);

    // when
    let relativeTime = relativeTimeFilter(givenTime);

    // then
    expect(relativeTime).toEqual('3 hours');
  });

  it('should return \'a day\' string if given time is a day before current time', () => {
    // given
    givenTime.setDate(givenTime.getDate() - 1);

    // when
    let relativeTime = relativeTimeFilter(givenTime);

    // then
    expect(relativeTime).toEqual('a day');
  });

  it('should return \'8 days\' string if given time is 8 days before current time', () => {
    // given
    givenTime.setDate(givenTime.getDate() - 8);

    // when
    let relativeTime = relativeTimeFilter(givenTime);

    // then
    expect(relativeTime).toEqual('8 days');
  });

  it('should return \'a month\' string if given time is a month before current time', () => {
    // given
    givenTime.setMonth(givenTime.getMonth() - 1);

    // when
    let relativeTime = relativeTimeFilter(givenTime);

    // then
    expect(relativeTime).toEqual('a month');
  });

  it('should return \'11 months\' string if given time is 11 months before current time', () => {
    // given
    givenTime.setMonth(givenTime.getMonth() - 11);

    // when
    let relativeTime = relativeTimeFilter(givenTime);

    // then
    expect(relativeTime).toEqual('11 months');
  });

  it('should return \'a year\' string if given time is a year before current time', () => {
    // given
    givenTime.setYear(givenTime.getFullYear() - 1);

    // when
    let relativeTime = relativeTimeFilter(givenTime);

    // then
    expect(relativeTime).toEqual('a year');
  });

  it('should return \'134 years\' string if given time is 134 years before current time', () => {
    // given
    givenTime.setYear(givenTime.getFullYear() - 134);

    // when
    let relativeTime = relativeTimeFilter(givenTime);

    // then
    expect(relativeTime).toEqual('134 years');
  });

  it('should return \'11 months\' string if given time is 11 months, 7 days, 5 hours and 3 minutes' +
         ' before current time',
     () => {
       // given
       givenTime.setMonth(givenTime.getMonth() - 11);
       givenTime.setDate(givenTime.getDate() - 7);
       givenTime.setHours(givenTime.getHours() - 5);
       givenTime.setMinutes(givenTime.getMinutes() - 3);

       // when
       let relativeTime = relativeTimeFilter(givenTime);

       // then
       expect(relativeTime).toEqual('11 months');
     });

  it(`should return 'didn't happen yet' string if given time is null`, () => {
    // given
    // null

    // when
    let relativeTime = relativeTimeFilter(null);

    // then
    expect(relativeTime).toEqual(`-`);
  });
});
