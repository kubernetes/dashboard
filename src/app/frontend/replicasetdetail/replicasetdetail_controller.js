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

import {UPWARDS, DOWNWARDS} from 'replicasetdetail/sortedheader_controller';
import {stateName as replicasets} from 'replicasetlist/replicasetlist_state';
import {stateName as logsStateName} from 'logs/logs_state';
import {StateParams as LogsStateParams} from 'logs/logs_state';

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
   * @param {!md.$dialog} $mdDialog
   * @param {!./replicasetdetail_state.StateParams} $stateParams
   * @param {!ui.router.$state} $state
   * @param {!angular.$resource} $resource
   * @param {!angular.$log} $log
   * @param {!backendApi.ReplicaSetDetail} replicaSetDetail
   * @param {!backendApi.Events} replicaSetEvents
   * @param {!./replicaset_service.ReplicaSetService} kdReplicaSetService
   * @ngInject
   */
  constructor(
      $mdDialog, $stateParams, $state, $resource, $log, replicaSetDetail, replicaSetEvents,
      kdReplicaSetService) {
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

    /** @private {!./replicasetdetail_state.StateParams} */
    this.stateParams_ = $stateParams;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /** @private {!./replicaset_service.ReplicaSetService} */
    this.kdReplicaSetService_ = kdReplicaSetService;

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
   * @export
   */
  getPodLogsHref(pod) {
    return this.state_.href(
        logsStateName,
        new LogsStateParams(this.stateParams_.namespace, this.stateParams_.replicaSet, pod.name));
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
   * Handles update of replicas count in replica set dialog.
   * @export
   */
  handleUpdateReplicasDialog() {
    this.kdReplicaSetService_.showUpdateReplicasDialog(
        this.replicaSetDetail.namespace, this.replicaSetDetail.name,
        this.replicaSetDetail.podInfo.current, this.replicaSetDetail.podInfo.desired);
  }

  /**
   * Handles replica set delete dialog.
   * @export
   */
  handleDeleteReplicaSetDialog() {
    this.kdReplicaSetService_.showDeleteDialog(
                                 this.stateParams_.namespace, this.stateParams_.replicaSet)
        .then(this.onReplicaSetDeleteSuccess_.bind(this), this.onReplicaSetDeleteError_.bind(this));
  }

  /**
   * Callbacks used after clicking dialog confirmation button in order to delete replica set
   * or log unsuccessful operation error.
   */

  /**
   * Changes state back to replica set list after successful deletion of replica set.
   * @private
   */
  onReplicaSetDeleteSuccess_() {
    this.log_.info('Replica set successfully deleted.');
    this.state_.go(replicasets);
  }

  /**
   * Logs error after replica set deletion failure.
   * @param {!angular.$http.Response} err
   * @private
   */
  onReplicaSetDeleteError_(err) { this.log_.error(err); }
}
