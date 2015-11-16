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
 * Controller for the service list view.
 *
 * @final
 */
export default class MicroserviceListController {
  /**
   * @param {!angular.$log} $log
   * @param {!angular.$resource} $resource
   * @ngInject
   */
  constructor($log, $resource) {
    /** @export {!Array<backendApi.Microservice>} */
    this.microservices = [];

    this.initialize_($log, $resource);
  }

  /**
   * @param {!angular.$log} $log
   * @param {!angular.$resource} $resource
   * @private
   */
  initialize_($log, $resource) {
    /** @type {!angular.Resource<!backendApi.MicroserviceList>} */
    let resource = $resource('/api/microservice');

    resource.get((microserviceList) => {
      $log.info('Successfully fetched microservice list: ', microserviceList);
      this.microservices = microserviceList.microservices;
    }, (err) => {
      $log.error('Error fetching microservice list: ', err);
    });
  }
}
