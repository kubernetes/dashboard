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
 * @final
 */
export default class JobInfoController {
  /**
   * Constructs replication controller info object.
   */
  constructor() {
    /**
     * Job details. Initialized from the scope.
     * @export {!backendApi.JobDetail}
     */
    this.job;

    /**
     * @export
     */
    this.i18n = i18n;
  }

  /**
   * @return {boolean}
   * @export
   */
  areDesiredPodsRunning() { return this.job.podInfo.running === this.job.podInfo.desired; }
}

/**
 * Definition object for the component that displays job info.
 *
 * @return {!angular.Directive}
 */
export const jobInfoComponent = {
  controller: JobInfoController,
  templateUrl: 'jobdetail/jobinfo.html',
  bindings: {
    /** {!backendApi.JobDetail} */
    'job': '=',
  },
};

export const i18n = {
  /** @export {string} @desc Resource details header. Appears on top of the page. */
  MSG_JOB_RESOURCE_DETAILS: goog.getMsg(`Resource details`),

  /** @export {string} @desc Details section header. Appears below main header. */
  MSG_JOB_DETAILS: goog.getMsg(`Details`),

  /** @export {string} @desc Job name. Appears in details section. */
  MSG_JOB_NAME: goog.getMsg(`Name`),

  /** @export {string} @desc Job namespace. Appears in details section. */
  MSG_JOB_NAMESPACE: goog.getMsg(`Namespace`),

  /** @export {string} @desc Job labels. Appears in details section. */
  MSG_JOB_LABELS: goog.getMsg(`Labels`),

  /** @export {string} @desc Job images. Appears in details section. */
  MSG_JOB_IMAGES: goog.getMsg(`Images`),

  /** @export {string} @desc Job status. Appears in details section. */
  MSG_JOB_STATUS: goog.getMsg(`Status`),

  /** @export {string} @desc Pods section header. Appears below details section. */
  MSG_JOB_PODS: goog.getMsg(`Pods`),

  /** @export {string} @desc Status of created pods. Appears next to number of created pods. */
  MSG_JOB_PODS_CREATED: goog.getMsg(`created`),

  /** @export {string} @desc Status of desired pods. Appears next to number of desired pods. */
  MSG_JOB_PODS_DESIRED: goog.getMsg(`desired`),

  /** @export {string} @desc Status of running pods. Appears next to number of running pods. */
  MSG_JOB_PODS_RUNNING: goog.getMsg(`running`),

  /** @export {string} @desc Status of pending pods. Appears next to number of pending pods. */
  MSG_JOB_PODS_PENDING: goog.getMsg(`pending`),

  /** @export {string} @desc Status of failed pods. Appears next to number of failed pods. */
  MSG_JOB_PODS_FAILED: goog.getMsg(`failed`),

  /** @export {string} @desc Pod status section header. Appears below main header. */
  MSG_JOB_PODS_STATUS: goog.getMsg(`Pods status`),

  /** @export {string} @desc Job completions. Appears in details section. */
  MSG_JOB_COMPLETIONS: goog.getMsg(`Completions`),

  /** @export {string} @desc Job paralleism. Appears in details section. */
  MSG_JOB_PARALLEISM: goog.getMsg(`Paralleism`),
};
