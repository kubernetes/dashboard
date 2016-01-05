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
 * Controller for the replica set card menu
 *
 * @final
 */
export default class ReplicaSetCardMenuController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$log} $log
   * @param {!./../replicasetdetail/deletereplicaset_service.DeleteReplicaSetService}
   *     kdDeleteReplicaSetService
   * @ngInject
   */
  constructor($state, $log, kdDeleteReplicaSetService) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.ReplicaSet}
     */
    this.replicaSet;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /** @private {!./../replicasetdetail/deletereplicaset_service.DeleteReplicaSetService} */
    this.kdDeleteReplicaSetService_ = kdDeleteReplicaSetService;
  }

  /**
   * @param {!function(MouseEvent)} $mdOpenMenu
   * @param {!MouseEvent} $event
   * @export
   */
  openMenu($mdOpenMenu, $event) { $mdOpenMenu($event); }

  /**
   * @export
   */
  viewDetails() {
    this.state_.go(stateName, new StateParams(this.replicaSet.namespace, this.replicaSet.name));
  }

  /**
   * @export
   */
  showDeleteDialog() {
    this.kdDeleteReplicaSetService_.showDeleteDialog(
                                       this.replicaSet.namespace, this.replicaSet.name)
        .then(() => this.state_.reload(), () => this.log_.error('Error deleting replica set'));
  }
}
