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

/** @final */
class LoginOptionsController {
  /**
   * @param {!angular.$sce} $sce
   * @ngInject
   */
  constructor($sce) {
    /** @private {!angular.$sce} */
    this.sce_ = $sce;
    /** @export {!Array<!angular.Component>} */
    this.options = [];
    /** @export {string} */
    this.selectedOption;
    /** @export {function()} - Callback function initialized from binding */
    this.onChange;
  }

  /**
   * @param {!angular.Component} option
   * @export
   */
  select(option) {
    this.options.forEach((option) => {
      option.selected = false;
    });

    option.selected = true;
    this.selectedOption = option.title;
  }

  /**
   * @param {!angular.Component} option
   * @export
   */
  addOption(option) {
    if (this.options.length === 0) {
      this.select(option);
    }

    this.options.push(option);
  }

  /** @export */
  onOptionChange() {
    this.options.forEach((option) => {
      option.selected = option.title === this.selectedOption;

      if (option.selected) {
        this.onChange();
      }
    });
  }

  /**
   * @export
   * @return {*}
   */
  acceptHtmlContent(content) {
    return this.sce_.trustAsHtml(content);
  }
}

/** @type {!angular.Component} */
export const loginOptionsComponent = {
  transclude: true,
  templateUrl: 'login/options.html',
  controller: LoginOptionsController,
  bindings: {
    'onChange': '&',
  },
};
