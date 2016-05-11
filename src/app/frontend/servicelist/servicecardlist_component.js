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

import {StateParams, stateName} from 'servicedetail/servicedetail_state';

/**
 * @final
 */
export class ServiceCardListController {
  /**
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) { this.state_ = $state; }

  /**
   * @param {!backendApi.Service} service
   * @return {string}
   * @export
   */
  getServiceDetailHref(service) {
    return this.state_.href(
        stateName, new StateParams(service.objectMeta.namespace, service.objectMeta.name));
  }
}

/**
 * Definition object for the component that displays service card list.
 *
 * @type {!angular.Component}
 */
export const serviceCardListComponent = {
  templateUrl: 'servicelist/servicecardlist.html',
  controller: ServiceCardListController,
  bindings: {
    /** {!Array<!backendApi.Service>} */
    'services': '<',
    /** {boolean} */
    'selectable': '<',
    /** {boolean} */
    'withStatuses': '<',
  },
};
