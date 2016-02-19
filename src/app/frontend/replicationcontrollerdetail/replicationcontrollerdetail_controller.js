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

import {UPWARDS, DOWNWARDS} from 'replicationcontrollerdetail/sortedheader_controller';
import {stateName as logsStateName} from 'logs/logs_state';
import {StateParams as LogsStateParams} from 'logs/logs_state';

// Filter type and source values for events.
const EVENT_ALL = 'All';
const EVENT_TYPE_WARNING = 'Warning';
const EVENT_SOURCE_USER = 'User';
const EVENT_SOURCE_SYSTEM = 'System';

/**
 * Controller for the replication controller details view.
 *
 * @final
 */
export default class ReplicationControllerDetailController {
  /**
   * @param {function(string):boolean} $mdMedia Angular Material $mdMedia service
   * @param {!./replicationcontrollerdetail_state.StateParams} $stateParams
   * @param {!ui.router.$state} $state
   * @param {!angular.$log} $log
   * @param {!backendApi.ReplicationControllerDetail} replicationControllerDetail
   * @param {!backendApi.Events} replicationControllerEvents
   * @ngInject
   */
  constructor(
      $mdMedia, $stateParams, $state, $resource, $log, replicationControllerDetail,
      replicationControllerEvents) {
    /** @export {function(string):boolean} */
    this.mdMedia = $mdMedia;

    /** @export {!backendApi.ReplicationControllerDetail} */
    this.replicationControllerDetail = replicationControllerDetail;

    /** @export {!backendApi.Events} */
    this.replicationControllerEvents = replicationControllerEvents;

    /** @export !Array<!backendApi.Event> */
    this.events = replicationControllerEvents.events;

    /** @const @export {!Array<string>} */
    this.eventTypeFilter = [EVENT_ALL, EVENT_TYPE_WARNING];

    /** @export {string} */
    this.eventType = EVENT_ALL;

    /** @const @export {!Array<string>} */
    this.eventSourceFilter = [EVENT_ALL, EVENT_SOURCE_USER, EVENT_SOURCE_SYSTEM];

    /** @export {string} */
    this.eventSource = EVENT_ALL;

    /** @private {!./replicationcontrollerdetail_state.StateParams} */
    this.stateParams_ = $stateParams;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /**
     * Name of column, that will be used for pods sorting.
     * @export {string}
     */
    this.sortPodsBy = 'name';

    /**
     * Pods sorting order.
     * @export {boolean}
     */
    this.podsOrder = UPWARDS;

    /**
     * Name of column, that will be used for events sorting.
     * @export {string}
     */
    this.sortEventsBy = 'lastSeen';

    /**
     * Events sorting order.
     * @export {boolean}
     */
    this.eventsOrder = DOWNWARDS;
  }

  /**
   * Returns true if sidebar is visible, false if it is hidden.
   * @returns {boolean}
   * @export
   */
  isSidebarVisible() { return this.mdMedia('gt-sm'); }

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
  hasEvents() { return this.events !== undefined && this.events.length > 0; }

  /**
   * Handles event filtering by type and source.
   * @export
   */
  handleEventFiltering() {
    this.events = this.filterByType(this.replicationControllerEvents.events, this.eventType);
    this.events = this.filterBySource(this.events, this.eventSource);
  }

  /**
   * @param {!backendApi.ReplicationControllerPod} pod
   * @export
   */
  getPodLogsHref(pod) {
    return this.state_.href(
        logsStateName,
        new LogsStateParams(
            this.stateParams_.namespace, this.stateParams_.replicationController, pod.name));
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

  /**
   * @param {!backendApi.ReplicationControllerPod} pod
   * @return {boolean}
   * @export
   */
  hasCpuUsage(pod) {
    return !!pod.metrics && !!pod.metrics.cpuUsageHistory && pod.metrics.cpuUsageHistory.length > 0;
  }

  /**
   * @param {!backendApi.ReplicationControllerPod} pod
   * @return {boolean}
   * @export
   */
  hasMemoryUsage(pod) {
    return !!pod.metrics && !!pod.metrics.memoryUsageHistory &&
        pod.metrics.memoryUsageHistory.length > 0;
  }
}
