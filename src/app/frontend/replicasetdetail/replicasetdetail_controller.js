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
const EVENT_SOURCE_USER = 'User';
const EVENT_SOURCE_SYSTEM = 'System';

/**
 * Controller for the replica set details view.
 *
 * @final
 */
export default class ReplicaSetDetailController {
  /**
   * @param {!backendApi.ReplicaSetDetail} replicaSetDetail
   * @param {!backendApi.Events} replicaSetEvents
   * @ngInject
   */
  constructor(replicaSetDetail, replicaSetEvents) {
    /** @export {!backendApi.ReplicaSetDetail} */
    this.replicaSetDetail = replicaSetDetail;

    /** @export {!backendApi.Events} */
    this.replicaSetEvents = replicaSetEvents;

    /** @export !Array<!backendApi.Event> */
    this.events = replicaSetEvents.events;

    /** @const @export {!Array<string>} */
    this.eventTypeFilter = [EVENT_ALL, EVENT_TYPE_WARNING];

    /** @export {string} */
    this.eventType = EVENT_ALL;

    /** @const @export {!Array<string>} */
    this.eventSourceFilter = [EVENT_ALL, EVENT_SOURCE_USER, EVENT_SOURCE_SYSTEM];

    /** @export {string} */
    this.eventSource = EVENT_ALL;
  }

  /**
   * TODO(floreks): Reuse this in replicasetlist controller.
   * Formats labels object to readable string.
   * @param {!Object} object
   * @return {string}
   * @export
   */
  formatLabelString(object) {
    let result = '';
    angular.forEach(object, function(value, key) { result += `,${key}=${value}`; });
    return result.substring(1);
  }

  /**
   * Returns true if event is a warning.
   * @param {!backendApi.Event} event
   * @return {boolean}
   * @export
   */
  isEventWarning(event) { return event.type === EVENT_TYPE_WARNING; }

  /**
   * Handles event filtering by type and source.
   * @export
   */
  handleEventFiltering() {
    this.events = this.filterByType(this.replicaSetEvents.events, this.eventType);
    this.events = this.filterBySource(this.events, this.eventSource);
  }

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
   * Filters events by their source.
   * @param {!Array<!backendApi.Event>} events
   * @param {string} source
   * @return {!Array<!backendApi.Event>}
   * @export
   */
  filterBySource(events, source) {
    if (source === EVENT_SOURCE_USER) {
      // TODO(maciaszczykm): Add filtering by user source.
      return events;
    } else if (source === EVENT_SOURCE_SYSTEM) {
      // TODO(maciaszczykm): Add filtering by system source.
      return events;
    } else {
      // In case of selected 'All' option.
      return events;
    }
  }
}
