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
export class CronJobDetailController {
  /**
   * @param {!backendApi.CronJobDetail} cronJobDetail
   * @param {!angular.Resource} kdActiveJobsResource
   * @ngInject
   */
  constructor(cronJobDetail, kdActiveJobsResource, kdEventsResource) {
    /** @export {!backendApi.CronJobDetail} */
    this.cronJobDetail = cronJobDetail;

    /** @export {!angular.Resource} */
    this.activeJobsResource = kdActiveJobsResource;

    /** @export {!angular.Resource} */
    this.eventsResource = kdEventsResource;
  }
}
