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

/** @final */
class PodWarningsController {
  constructor() {
    /** @private {number} */
    this.limit_;
    /** @private {boolean} */
    this.hide_ = true;
    /** @export {!Array<!backendApi.Event>} */
    this.warnings;
  }

  /** @export */
  $onInit() {
    // If not set set default limit to 4
    this.limit_ = this.limit_ || 4;
  }

  /**
   * @export
   * @return {number}
   */
  getLimitTo() {
    return this.hide_ ? this.limit_ : this.warnings.length;
  }

  /**
   * @export
   * @return {boolean}
   */
  isHidden() {
    return this.hide_;
  }

  /**
   * @export
   * @return {boolean}
   */
  shouldShowAll() {
    return this.warnings.length <= this.limit_;
  }

  /** @export */
  switchVisibility() {
    this.hide_ = !this.hide_;
  }
}

/**
 * @return {!angular.Component}
 */
export const podWarningsComponent = {
  bindings: {
    'warnings': '<',
    'limit': '<',
  },
  controller: PodWarningsController,
  templateUrl: 'common/components/podwarnings/podwarnings.html',
};
