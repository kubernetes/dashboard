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
 * Returns directive that runs code after a template render.
 *
 * @return {!angular.Directive}
 * @ngInject
 */
export default function termOpenDirective($timeout) {
  let def = {
    restrict: 'A',
    terminal: true,
    transclude: false,
    /** @param {!TermOpen.attrs} attrs */
    link: function(scope, element, attrs) {
      // We call $timeout with a zero timeout so that the function code
      // is placed in the browser execution queue. Since the render is
      // also already in the queue this ensures that the code is run after
      // the template is rendered.
      $timeout(scope.$eval(attrs.termOpen), 0);  // Calling a scoped method
    },
  };
  return def;
}
