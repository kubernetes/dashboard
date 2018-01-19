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
 * @param {!angular.$log} $log
 * @return {!angular.Directive}
 * @ngInject
 */
export default function uploadFileDirective($log) {
  return {
    restrict: 'E',
    templateUrl: 'common/components/uploadfile/uploadfile.html',
    scope: {
      /** @export */ onLoad: '&',
                     /** @export */
                     label: '@',
    },
    link: (scope, element) => {
      if (!scope.onLoad) {
        $log.error('Required function callback \'onLoad\' not provided.');
        return;
      }

      let input = angular.element(element[0].querySelector('#fileInput'));
      let button = angular.element(element[0].querySelector('#uploadButton'));
      let textInput = angular.element(element[0].querySelector('#textInput'));

      if (input.length && button.length && textInput.length) {
        button.on('click', () => {
          input[0].click();
        });

        textInput.on('click', () => {
          input[0].click();
        });
      }

      input.on('change', (e) => {
        let file = e.target.files[0];
        if (file) {
          scope.fileName = file.name;

          let reader = new FileReader();
          reader.onload = (event) => {
            scope.onLoad(
                /** !kdFile */ {file: {name: file.name, content: event.target.result}});
            scope.$apply();
          };

          reader.onerror = (error) => $log.error('Error reading file:', error);
          reader.readAsText(file);
        }
      });
    },
  };
}
