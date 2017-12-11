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
 * Service class for logs management.
 * @final
 */
export class LogsService {
  /** @ngInject */
  constructor() {
    /** @private {boolean} */
    this.inverted_ = true;

    /** @private {boolean} */
    this.compact_ = false;

    /** @private {boolean} */
    this.showTimestamp_ = false;

    /** @private {boolean} */
    this.previous_ = false;

    /** @private {boolean} */
    this.following_ = false;
  }

  setFollowing() {
    this.following_ = !this.following_;
  }

  /**
   * @return {boolean}
   * @export
   */
  getFollowing() {
    return this.following_;
  }

  setInverted() {
    this.inverted_ = !this.inverted_;
  }

  /**
   * @return {boolean}
   * @export
   */
  getInverted() {
    return this.inverted_;
  }

  setCompact() {
    this.compact_ = !this.compact_;
  }

  /**
   * @return {boolean}
   * @export
   */
  getCompact() {
    return this.compact_;
  }

  setShowTimestamp() {
    this.showTimestamp_ = !this.showTimestamp_;
  }

  /**
   * @return {boolean}
   * @export
   */
  getShowTimestamp() {
    return this.showTimestamp_;
  }

  setPrevious() {
    this.previous_ = !this.previous_;
  }

  /**
   * @return {boolean}
   * @export
   */
  getPrevious() {
    return this.previous_;
  }

  /**
   * @param {string} pod
   * @param {string} container
   * @return {string}
   */
  getLogFileName(pod, container) {
    return `logs-from-${container}-in-${pod}.txt`;
  }
}
