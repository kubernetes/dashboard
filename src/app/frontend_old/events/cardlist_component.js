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
 * @final
 */
export class EventCardListController {
  /**
   * @ngInject
   */
  constructor() {
    /**
     * Initialized from the scope.
     * @export {!backendApi.EventList}
     */
    this.eventList;

    /** @export {!angular.Resource} Initialized from binding. */
    this.eventListResource;

    /** @export */
    this.i18n = i18n;
  }

  /**
   * Returns select id string or undefined if list or list resource are not defined.
   * It is needed to enable/disable data select support (pagination, sorting) for particular list.
   *
   * @return {string}
   * @export
   */
  getSelectId() {
    const selectId = 'events';

    if (this.eventList !== undefined && this.eventListResource !== undefined) {
      return selectId;
    }

    return '';
  }

  /**
   * Returns true if event is a warning.
   * @param {!backendApi.Event} event
   * @return {boolean}
   * @export
   */
  isEventWarning(event) {
    return event.type === EVENT_TYPE_WARNING;
  }

  /**
   * Returns true if there are events to display.
   *
   * @returns {boolean}
   * @export
   */
  hasEvents() {
    return this.eventList !== undefined && this.eventList.events.length > 0;
  }
}

/**
 * Definition object for the component that displays replication controller events card.
 *
 * @type {!angular.Component}
 */
export const eventCardListComponent = {
  templateUrl: 'events/cardlist.html',
  controller: EventCardListController,
  bindings: {
    /** {!backendApi.EventList} */
    'eventList': '<',
    /** {!angular.Resource} */
    'eventListResource': '<',
  },
};

const i18n = {
  /** @export {string} @desc Label 'Warning' for the event selection drop-down. */
  MSG_EVENTS_WARNING_LABEL: goog.getMsg('Warning'),
};

const EVENT_TYPE_WARNING = i18n.MSG_EVENTS_WARNING_LABEL;
