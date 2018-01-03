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
export class ContentCardController {
  /**
   * @param {!angular.$transclude} $transclude
   * @ngInject
   */
  constructor($transclude) {
    /** @private {Object} */
    this.transclude_ = $transclude;
  }

  /**
   * Returns true if transclusion slot 'title' has been filled.
   * @export
   */
  isTitleSlotFilled() {
    return this.transclude_.isSlotFilled('title');
  }

  /**
   * Returns true if transclusion slot 'footer' has been filled.
   * @export
   */
  isFooterSlotFilled() {
    return this.transclude_.isSlotFilled('footer');
  }
}

/**
 * Represents a card that can carry any content in views.
 * Usage:
 *  <kd-content-card>
 *    <kd-title>My Title</kd-title>
 *    <kd-content>My Content</kd-content>
 *    <kd-footer>My Footer</kd-footer>
 *  </kd-content-card>
 *
 * @type {!angular.Component}
 */
export const contentCardComponent = {
  templateUrl: 'common/components/contentcard/contentcard.html',
  controller: ContentCardController,
  transclude: /** @type {undefined} TODO(bryk): Remove this when externs are fixed */ ({
    'title': '?kdTitle',
    'content': '?kdContent',
    'footer': '?kdFooter',
  }),
};
