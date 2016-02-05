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
import {
  stateName as replicationcontrollers,
} from 'replicationcontrollerlist/replicationcontrollerlist_state';
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
   * @param {!md.$dialog} $mdDialog
   * @param {!./replicationcontrollerdetail_state.StateParams} $stateParams
   * @param {!ui.router.$state} $state
   * @param {!angular.$resource} $resource
   * @param {!angular.$log} $log
   * @param {!backendApi.ReplicationControllerDetail} replicationControllerDetail
   * @param {!backendApi.Events} replicationControllerEvents
   * @param {!./replicationcontroller_service.ReplicationControllerService}
   * kdReplicationControllerService
   * @ngInject
   */
  constructor(
      $mdDialog, $stateParams, $state, $resource, $log, replicationControllerDetail,
      replicationControllerEvents, kdReplicationControllerService) {
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

    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /** @private {!./replicationcontroller_service.ReplicationControllerService} */
    this.kdReplicationControllerService_ = kdReplicationControllerService;

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

    /**
     * Maximum length of name before it is truncated.
     * @const
     * @export {number}
     */
    this.nameMaxLength = 16;

    /**
     * Maximum length of container image before it is truncated.
     * @const
     * @export {number}
     */
    this.imageMaxLength = 32;
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
   * @return {boolean}
   * @export
   */
  areDesiredPodsRunning() {
    return this.replicationControllerDetail.podInfo.running ===
        this.replicationControllerDetail.podInfo.desired;
  }

  /**
   * Handles update of replicas count in replication controller dialog.
   * @export
   */
  handleUpdateReplicasDialog() {
    this.kdReplicationControllerService_.showUpdateReplicasDialog(
        this.replicationControllerDetail.namespace, this.replicationControllerDetail.name,
        this.replicationControllerDetail.podInfo.current,
        this.replicationControllerDetail.podInfo.desired);
  }

  /**
   * Handles replication controller delete dialog.
   * @export
   */
  handleDeleteReplicationControllerDialog() {
    this.kdReplicationControllerService_
        .showDeleteDialog(this.stateParams_.namespace, this.stateParams_.replicationController)
        .then(this.onReplicationControllerDeleteSuccess_.bind(this));
  }

  /**
   * @param {!backendApi.ReplicationControllerPod} pod
   * @return {boolean}
   * @export
   */
  hasCpuUsage(pod) {
    return !!pod.metrics && (!!pod.metrics.cpuUsage || pod.metrics.cpuUsage === 0);
  }

  /**
   * @param {!backendApi.ReplicationControllerPod} pod
   * @return {boolean}
   * @export
   */
  hasMemoryUsage(pod) {
    return !!pod.metrics && (!!pod.metrics.memoryUsage || pod.metrics.memoryUsage === 0);
  }

  /**
   * Callbacks used after clicking dialog confirmation button in order to delete replication
   * controller
   * or log unsuccessful operation error.
   */

  /**
   * Changes state back to replication controller list after successful deletion of replication
   * controller.
   * @private
   */
  onReplicationControllerDeleteSuccess_() {
    this.log_.info('Replication controller successfully deleted.');
    this.state_.go(replicationcontrollers);
  }
}
