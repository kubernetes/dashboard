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

import eventsModule from 'events/module';

describe('Event Card List controller', () => {
  /**
   * Event Card List controller.
   * @type {!EventCardListController}
   */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(eventsModule.name);

    angular.mock.inject(($componentController, $rootScope) => {
      ctrl = $componentController('kdEventCardList', {$scope: $rootScope});
    });
  });

  it('should return true when there are events to display', () => {
    // given
    ctrl.eventList = {events: ['Some event'], listMeta: {totalItems: 1}};

    // when
    let result = ctrl.hasEvents();

    // then
    expect(result).toBeTruthy();
  });

  it('should return false if there are no events to display', () => {
    // given
    ctrl.eventList = {events: [], listMeta: {totalItems: 0}};

    // when
    let result = ctrl.hasEvents();

    // then
    expect(result).toBeFalsy();
  });

  it('should return true when warning event', () => {
    // given
    let event = {
      type: 'Warning',
      message: 'event-1',
    };

    // when
    let result = ctrl.isEventWarning(event);

    // then
    expect(result).toBeTruthy();
  });

  it('should return false when not warning event', () => {
    // given
    let event = {
      type: 'Normal',
      message: 'event-1',
    };

    // when
    let result = ctrl.isEventWarning(event);

    // then
    expect(result).toBeFalsy();
  });

  it('should return correct select id', () => {
    // given
    let expected = 'events';
    ctrl.eventList = {};
    ctrl.eventListResource = {};

    // when
    let got = ctrl.getSelectId();

    // then
    expect(got).toBe(expected);
  });

  it('should return empty select id', () => {
    // given
    let expected = '';

    // when
    let got = ctrl.getSelectId();

    // then
    expect(got).toBe(expected);
  });
});
