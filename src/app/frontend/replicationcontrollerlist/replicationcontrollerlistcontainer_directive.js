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

import computeContainerHeight from './replicationcontrollerlistcontainer';

/**
 * Returns directive definition object for the replication controller list directive.
 *
 * @param {function(string):boolean} $mdMedia Angular Material $mdMedia service
 * @return {!angular.Directive}
 * @ngInject
 */
export default function replicationControllerListContainerDirective($mdMedia) {
  return {
    scope: {},
    transclude: true,
    /**
     * @param {!angular.Scope} scope
     * @param {!angular.JQLite} jQliteElem
     */
    link: function(scope, jQliteElem) {
      /** @type {!Element} */
      let element = jQliteElem[0];
      let container = element.querySelector('.kd-replication-controller-list-container');
      if (!container) {
        throw new Error(
            'Required child element .kd-replication-controller-list-container not found');
      }
      let nonNullContainer = container;
      // scope.$watch(() => computeContainerHeight(nonNullContainer, $mdMedia), (newHeight) => {
      //   container.style.height = `${newHeight}px`;
      //   // This is needed to make it work on IE
      //   container.style.minHeight = `${newHeight + 1}px`;
      // });
    },
    templateUrl: 'replicationcontrollerlist/replicationcontrollerlistcontainer.html',
  };
}
