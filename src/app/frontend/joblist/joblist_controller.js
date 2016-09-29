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
 * Controller for the job list view.
 *
 * @final
 */
export class JobListController {
  /**
   * @param {!backendApi.JobList} jobList
   * @param {!angular.Resource} kdJobListResource
   * @ngInject
   */
  constructor(jobList, kdJobListResource) {
    /** @export {!backendApi.JobList} */
    this.jobList = jobList;

    /** @export {!angular.Resource} */
    this.jobListResource = kdJobListResource;

    /** @export */
    this.i18n = i18n;
  }

  /**
   * @return {boolean}
   * @export
   */
  shouldShowZeroState() {
    return this.jobList.jobs.length === 0;
  }
}

const i18n = {
  /** @export {string} @desc Title for graph card displaying CPU metric of jobs. */
  MSG_JOB_LIST_CPU_GRAPH_CARD_TITLE: goog.getMsg('CPU usage history'),
  /** @export {string} @desc Title for graph card displaying memory metric of jobs. */
  MSG_JOB_LIST_MEMORY_GRAPH_CARD_TITLE: goog.getMsg('Memory usage history'),
};
