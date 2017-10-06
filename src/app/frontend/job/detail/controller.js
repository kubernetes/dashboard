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
export class JobDetailController {
  /**
   * @param {!backendApi.JobDetail} jobDetail
   * @param {!angular.Resource} kdJobPodsResource
   * @param {!angular.Resource} kdJobEventsResource
   * @ngInject
   */
  constructor(jobDetail, kdJobPodsResource, kdJobEventsResource) {
    /** @export {!backendApi.JobDetail} */
    this.jobDetail = jobDetail;

    /** @export {!angular.Resource} */
    this.jobPodsResource = kdJobPodsResource;

    /** @export {!angular.Resource} */
    this.eventListResource = kdJobEventsResource;
  }
}
