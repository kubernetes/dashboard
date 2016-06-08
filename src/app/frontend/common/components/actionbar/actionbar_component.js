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
export class ActionbarComponent {
  /**
   * @param {!angular.JQLite} $element
   * @param {!angular.Scope} $scope
   * @ngInject
   */
  constructor($element, $scope) {
    /** @private {!angular.JQLite}} */
    this.element_ = $element;
    /** @private {!angular.Scope} */
    this.scope_ = $scope;
  }

  /**
   * @export
   */
  $onInit() {
    let closestContent = this.element_.parent().find('md-content');
    if (!closestContent || closestContent.length === 0) {
      throw new Error('Actionbar component requires sibling md-content element');
    }

    this.computeScrollClass_(closestContent[0]);  // Initialize scroll state at first.

    let computeScrollClassCallback =
        (/** !Event */ e) => { this.computeScrollClass_(/** @type {!Element} */ (e.target)); };
    closestContent.on('scroll', computeScrollClassCallback);
    this.scope_.$on(
        '$destroy', () => { closestContent.off('scroll', computeScrollClassCallback); });
  }

  /**
   * Computes scroll class based on scroll position and applies it to current element.
   * @param {!Element} mdContentElement
   * @private
   */
  computeScrollClass_(mdContentElement) {
    if (mdContentElement.scrollTop > 0) {
      this.element_.removeClass('kd-actionbar-not-scrolled');
    } else {
      this.element_.addClass('kd-actionbar-not-scrolled');
    }
  }
}

/**
 * Returns actionbar component.
 *
 * @return {!angular.Directive}
 */
export const actionbarComponent = {
  templateUrl: 'common/components/actionbar/actionbar.html',
  transclude: true,
  controller: ActionbarComponent,
};
