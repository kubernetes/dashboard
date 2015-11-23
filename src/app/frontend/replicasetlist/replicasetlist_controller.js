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

import {StateParams} from 'replicasetdetail/replicasetdetail_state';
import {stateName} from 'replicasetdetail/replicasetdetail_state';

/**
 * Controller for the replica set list view.
 *
 * @final
 */
export default class ReplicaSetListController {
  /**
   * @param {!angular.$log} $log
   * @param {!angular.$resource} $resource
   * @param {!ui.router.$state} $state
   * @param {!backendApi.ReplicaSetList} replicaSets
   * @ngInject
   */
  constructor($log, $resource, $state, replicaSets) {
    /** @export {!Array<backendApi.ReplicaSet>} */
    this.replicaSets = replicaSets.replicaSets;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    this.initialize_($log, $resource);
  }

  /**
   * @param {!angular.$log} $log
   * @param {!angular.$resource} $resource
   * @private
   */
  initialize_($log, $resource) {
    /** @type {!angular.Resource<!backendApi.ReplicaSetList>} */
    let resource = $resource('/api/replicasets');

    resource.get(
        (replicaSetList) => {
          $log.info('Successfully fetched Replica Set list: ', replicaSetList);
          this.replicaSets = replicaSetList.replicaSets;
        },
        (err) => { $log.error('Error fetching Replica Set list: ', err); });
  }

  /**
   * @param {!backendApi.ReplicaSet} replicaSet
   * @return {string}
   * @export
   */
  getReplicaSetDetailHref(replicaSet) {
    return this.state_.href(stateName, new StateParams(replicaSet.namespace, replicaSet.name));
  }
}
