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

import eventsModule from 'events/events_module';

describe('Event Card List controller', () => {
  /**
   * Event Card List controller.
   * @type {!events/eventcardlist_component.EventCardListController}
   */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(eventsModule.name);

    angular.mock.inject(($componentController, $rootScope) => {
      ctrl = $componentController('kdEventCardList', {$scope: $rootScope});
    });
  });

  it('should not filter any events if all option is selected', () => {
    // given
    let eventType = 'All';
    let eventList = {
      events: [
        {
          type: 'Warning',
          message: 'event-1',
        },
        {
          type: 'Normal',
          message: 'event-2',
        },
      ],
    };

    // when
    let result = ctrl.filterByType_(eventList.events, eventType);

    // then
    expect(result.length).toEqual(2);
  });

  it('should filter all non-warning events if warning option is selected', () => {
    // given
    let eventType = 'Warning';
    let eventList = {
      events: [
        {
          type: 'Warning',
          message: 'event-1',
        },
        {
          type: 'Normal',
          message: 'event-2',
        },
        {
          type: 'Normal',
          message: 'event-3',
        },
      ],
    };

    // when
    let result = ctrl.filterByType_(eventList.events, eventType);

    // then
    expect(result.length).toEqual(1);
  });

  it('should return true when there are events to display', () => {
    // given
    ctrl.filteredEventList = {events: ['Some event'], listMeta: {totalItems: 1}};

    // when
    let result = ctrl.hasEvents();

    // then
    expect(result).toBeTruthy();
  });

  it('should return false if there are no events to display', () => {
    // given
    ctrl.filteredEventList = {events: [], listMeta: {totalItems: 0}};

    // when
    let result = ctrl.hasEvents();

    // then
    expect(result).toBeFalsy();
  });

  it('should filter events and show only warnings', () => {
    // given
    ctrl.eventType = 'Warning';
    ctrl.eventList = {
      events: [
        {
          type: 'Warning',
          message: 'event-1',
        },
        {
          type: 'Normal',
          message: 'event-2',
        },
        {
          type: 'Normal',
          message: 'event-3',
        },
      ],
    };

    // when
    ctrl.handleEventFiltering();

    // then
    expect(ctrl.filteredEventList.events.length).toEqual(1);
  });

  it('should not filter any events and show all', () => {
    // given
    ctrl.eventType = 'All';
    ctrl.eventList = {
      events: [
        {
          type: 'Warning',
          message: 'event-1',
        },
        {
          type: 'Normal',
          message: 'event-2',
        },
        {
          type: 'Normal',
          message: 'event-3',
        },
      ],
    };

    // when
    ctrl.handleEventFiltering();

    // then
    expect(ctrl.filteredEventList.events.length).toEqual(3);
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
});
