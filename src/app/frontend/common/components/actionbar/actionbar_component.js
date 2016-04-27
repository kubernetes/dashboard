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
   * @param {!angular.JQLite} $document
   * @param {!angular.JQLite} $element
   * @param {!angular.Scope} $scope
   * @param {!angular.$window} $window
   * @ngInject
   */
  constructor($document, $element, $scope, $window) {
    /** @private {!angular.JQLite} */
    this.document_ = $document;
    /** @private {!angular.JQLite}} */
    this.element_ = $element;
    /** @private {!angular.Scope} */
    this.scope_ = $scope;
    /** @private {!angular.$window} */
    this.window_ = $window;
  }

  /**
   * @export
   */
  $onInit() {
    this.computeScrollClass_();

    let computeScrollClassCallback = () => { this.computeScrollClass_(); };

    this.document_.on('scroll', computeScrollClassCallback);
    this.scope_.$on(
        '$destroy', () => { this.document_.off('scroll', computeScrollClassCallback); });
  }

  /**
   * Computes scroll class based on scroll position and applies it to current element.
   * @private
   */
  computeScrollClass_() {
    if (this.window_.scrollY > 0) {
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
