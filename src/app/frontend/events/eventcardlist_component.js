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
  templateUrl: 'events/eventcardlist.html',
  controller: EventCardListController,
  bindings: {
    /** {!backendApi.EventList} */
    'eventList': '<',
    /** {!angular.Resource} */
    'eventListResource': '<',
  },
};

const i18n = {
  /** @export {string} @desc Label for the events card. */
  MSG_EVENTS_CARD: goog.getMsg('Events'),
  /** @export {string} @desc Label 'Type' for the event type selection box on the events list page. */
  MSG_EVENTS_TYPE_LABEL: goog.getMsg('Type'),
  /** @export {string} @desc Label 'Message' for the event message column of the events table (events list page). */
  MSG_EVENTS_MESSAGE_LABEL: goog.getMsg('Message'),
  /** @export {string} @desc Label 'Source' for the event source column of the events table (events list page). */
  MSG_EVENTS_SOURCE_LABEL: goog.getMsg('Source'),
  /** @export {string} @desc Label 'Sub-object' for the respective column of the events table (events list page). */
  MSG_EVENTS_SUB_OBJECT_LABEL: goog.getMsg('Sub-object'),
  /** @export {string} @desc Label 'Count' for event count column of the events table (events list page). */
  MSG_EVENTS_COUNT_LABEL: goog.getMsg('Count'),
  /** @export {string} @desc Label 'First seen' for the respective column of the events table (events list page). */
  MSG_EVENTS_FIRST_SEEN_LABEL: goog.getMsg('First seen'),
  /** @export {string} @desc Label 'Last seen' for the respective column of the events table (events list page). */
  MSG_EVENTS_LAST_SEEN_LABEL: goog.getMsg('Last seen'),
  /** @export {string} @desc Title of section when there are no events. */
  MSG_EVENTS_NO_EVENTS_TITLE: goog.getMsg('There is nothing to display here'),
  /** @export {string} @desc User help on the events page when no events are to be displayed. */
  MSG_EVENTS_NO_EVENTS_USER_HELP: goog.getMsg(`It is possible that all events have expired.`),
  /** @export {string} @desc Label 'All' for the event selection drop-down. */
  MSG_EVENTS_ALL_LABEL: goog.getMsg('All'),
  /** @export {string} @desc Label 'Warning' for the event selection drop-down. */
  MSG_EVENTS_WARNING_LABEL: goog.getMsg('Warning'),
};

const EVENT_TYPE_WARNING = i18n.MSG_EVENTS_WARNING_LABEL;
