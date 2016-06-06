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

import MiddleEllipsisController from './middleellipsis_controller';
import computeTextLength from './middleellipsis';

/**
 * Returns directive definition for middle ellipsis.
 *
 * @param {!function(string, number): string} middleEllipsisFilter
 *
 * @return {!angular.Directive}
 * @ngInject
 */
export default function middleEllipsisDirective(middleEllipsisFilter) {
  return {
    controller: MiddleEllipsisController,
    controllerAs: 'ellipsisCtrl',
    templateUrl: 'common/components/middleellipsis/middleellipsis.html',
    scope: {},
    bindToController: {
      'displayString': '@',
    },
    /**
     * @param {!angular.Scope} scope
     * @param {!angular.JQLite} jQLiteElem
     * @param {!angular.Attributes} attr
     * @param {!MiddleEllipsisController} ctrl
     */
    link: function(scope, jQLiteElem, attr, ctrl) {
      /** @type {!Element} */
      let element = jQLiteElem[0];
      let container = element.parentElement;
      let ellipsisElem = element.querySelector('.kd-middleellipsis');

      if (!container) {
        throw new Error(`Required parent container not found`);
      }

      if (!ellipsisElem) {
        throw new Error('Required element with class .kd-middleellipsis not found');
      }

      let nonNullElement = ellipsisElem;

      scope.$watch(
          () => [container.offsetWidth, ctrl.displayString], ([containerWidth, displayString]) => {
            let newLength = computeTextLength(containerWidth, nonNullElement, element,
                                              middleEllipsisFilter, displayString);
            ctrl.maxLength = newLength;
          }, true);
    },
  };
}
