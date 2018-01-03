// Copyright 2017 The Kubernetes Authors.
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
export class DaemonSetDetailController {
  /**
   * @param {!backendApi.DaemonSetDetail} daemonSetDetail
   * @param {!angular.Resource} kdDaemonSetPodsResource
   * @param {!angular.Resource} kdDaemonSetServicesResource
   * @param {!angular.Resource} kdDaemonSetEventsResource
   * @ngInject
   */
  constructor(
      daemonSetDetail, kdDaemonSetPodsResource, kdDaemonSetServicesResource,
      kdDaemonSetEventsResource) {
    /** @export {!backendApi.DaemonSetDetail} */
    this.daemonSetDetail = daemonSetDetail;

    /** @export {!angular.Resource} */
    this.daemonSetPodsResource = kdDaemonSetPodsResource;

    /** @export {!angular.Resource} */
    this.daemonSetServicesResource = kdDaemonSetServicesResource;

    /** @export {!angular.Resource} */
    this.daemonSetEventsResource = kdDaemonSetEventsResource;
  }
}
