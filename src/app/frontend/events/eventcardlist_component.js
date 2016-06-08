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

// Filter type and source values for events.
const EVENT_ALL = 'All';
const EVENT_TYPE_WARNING = 'Warning';

/**
 * @final
 */
export class EventCardListController {
  /**
   * @param {!angular.$interpolate} $interpolate
   * @ngInject
   */
  constructor($interpolate) {
    /**
     * Initialized from the scope.
     * @export {!Array<!backendApi.Event>}
     */
    this.events;

    /** @export {!Array<!backendApi.Event>} */
    this.filteredEvents = this.events;

    /** @const @export {!Array<string>} */
    this.eventTypeFilter = [EVENT_ALL, EVENT_TYPE_WARNING];

    /** @export {string} */
    this.eventType = EVENT_ALL;

    /** @private */
    this.interpolate_ = $interpolate;

    /** @export */
    this.i18n = i18n;
  }

  /**
   * Returns true if event is a warning.
   * @param {!backendApi.Event} event
   * @return {boolean}
   * @export
   */
  isEventWarning(event) { return event.type === EVENT_TYPE_WARNING; }

  /**
   * Returns true if there are events to display.
   *
   * @returns {boolean}
   * @export
   */
  hasEvents() { return this.filteredEvents !== undefined && this.filteredEvents.length > 0; }

  /**
   * Handles event filtering by type and source.
   * @export
   */
  handleEventFiltering() { this.filteredEvents = this.filterByType(this.events, this.eventType); }

  /**
   * Filters events by their type.
   * @param {!Array<!backendApi.Event>} events
   * @param {string} type
   * @return {!Array<!backendApi.Event>}
   * @export
   */
  filterByType(events, type) {
    if (type === EVENT_TYPE_WARNING) {
      return events.filter((event) => { return event.type === EVENT_TYPE_WARNING; });
    } else {
      // In case of selected 'All' option.
      return events;
    }
  }

  /**
   * Formats and localizes a label string with the first
   * time an event has been seen.
   * @export
   * @param  {string} when the event was first seen
   * @return {string} the localized message
   */
  getFirstSeenDateLabel(date) {
    /** @export {string} @desc Label 'First seen at [some date] UTC', saying when an
        event was first seen (events page). */
    let MSG_EVENTS_FIRST_SEEN_DATE_LABEL =
        goog.getMsg('First seen at {$date} UTC', {'date': this.formatDate(date)});
    return MSG_EVENTS_FIRST_SEEN_DATE_LABEL;
  }

  /**
   * Formats and localizes a label string with the last
   * time an event has been seen.
   * @export
   * @param  {string} when the event was last seen
   * @return {string} the localized message
   */
  getLastSeenDateLabel(date) {
    /** @export {string} @desc Label 'Last seen at [some date] UTC', saying when an
        event was last seen (events page). */
    let MSG_EVENTS_LAST_SEEN_DATE_LABEL =
        goog.getMsg('Last seen at {$date} UTC', {'date': this.formatDate(date)});
    return MSG_EVENTS_LAST_SEEN_DATE_LABEL;
  }

  /**
   * Formats a date to be displayed.
   * @private
   * @param  {string} date - to be formatted
   * @return {string} the formatted date
   */
  formatDate(date) {
    let filter = this.interpolate_(`{{date | date:'d/M/yy HH:mm':'UTC'}}`);
    return filter({'date': date});
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
    /** {!Array<!backendApi.Event>} */
    'events': '=',
  },
};

const i18n = {
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
  /** @export {string} @desc Title 'No events were found', which appears in the center of the events page when
      there are no events to display */
  MSG_EVENTS_NO_EVENTS_TITLE: goog.getMsg('No events were found'),
  /** @export {string} @desc User help on the events page when no events are to be displayed. */
  MSG_EVENTS_NO_EVENTS_USER_HELP: goog.getMsg(
      `There are no events to display. ` +
      `It's possible that all of them have expired.`),
  /** @export {string} @desc Action 'Learn more' which appears as a link next to the user help on the events page.*/
  MSG_EVENTS_LEARN_MORE_ACTION: goog.getMsg('Learn more'),
};
