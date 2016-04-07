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
 * Provides ng-model binding for input elements with file type and updates the model
 * on change with {name:string, content:string} custom object form of the selected file.
 *
 * @param {!angular.$log} $log
 * @return {!angular.Directive}
 * @ngInject
 */
export default function fileReaderDirective($log) {
  return {
    restrict: 'A',
    require: ['^kdUpload', 'ngModel'],
    link: function(scope, element, attrs, ctrls) {
      /** @type {./upload_controller.UploadController} */
      let uploadController = ctrls[0];
      uploadController.registerBrowseFileFunction(() => (element[0].click()));

      element.bind('change', (changeEvent) => {
        /** @type {?File} */
        let file = changeEvent.target.files[0];
        if (!file) {
          $log.error('Error invalid file: ', file);
          return;
        }
        let reader = new FileReader();
        reader.onload = (event) => {
          /** @type {!angular.NgModelController} */
          let ngModelController = ctrls[1];
          ngModelController.$setViewValue({name: file.name, content: event.target.result});
        };
        reader.onerror = (error) => $log.error('Error reading file:', error);
        reader.readAsText(file);
      });
    },
  };
}
