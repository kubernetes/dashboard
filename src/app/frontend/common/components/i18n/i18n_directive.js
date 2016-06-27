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
 * Directive which can render i18n messages that contain angular directives
 * as placeholders.
 *
 * @param  {!angular.$compile} $compile
 * @return {!angular.Directive}
 * @ngInject
 */
export default function i18nDirective($compile) {
  return {
    restrict: 'E',
    scope: {message: '@'},
    link: function(scope, element) {
      scope.$watch('message', function(i18nMessage) {
        if (!i18nMessage) return;
        let rendered = $compile(`<span>${i18nMessage}</span>`)(scope);
        element.append(rendered);
      });
    },
  };
}
