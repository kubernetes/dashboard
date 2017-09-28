// Copyright 2017 The Kubernetes Dashboard Authors.
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
export default class MiddleEllipsisController {
  /**
   * Constructs middle ellipsis controller.
   * @ngInject
   * @param {!angular.JQLite} $element
   */
  constructor($element) {
    /** @export {string} Initialized from the scope. */
    this.displayString;

    /** @private {!angular.JQLite} */
    this.element_ = $element;
  }

  isTruncated() {
    let c = this.element_;
    c.addClass("kd-middleellipsis-width");
    let cOfsWidth = c[0].offsetWidth;
    c.removeClass("kd-middleellipsis-width");
    return cOfsWidth > this.element_[0].offsetWidth;
  }

  getDisplayStringAtTooltip() {
    return goog.getMsg(this.displayString);
  }
}

/**
 * Middle ellipsis component definition.
 *
 * @type {!angular.Component}
 */
export const middleEllipsisComponent = {
  bindings: {
    'displayString': '@',
  },
  controller: MiddleEllipsisController,
  controllerAs: 'ellipsisCtrl',
  templateUrl: 'common/components/middleellipsis/middleellipsis.html',
};
