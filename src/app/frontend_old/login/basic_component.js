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

import LoginSpec from './spec';

/** @final */
class BasicLoginController {
  /** @ngInject */
  constructor() {
    /** @export {!angular.Component} */
    this.loginOptionsCtrl;
    /** @export {boolean} */
    this.selected = false;
    /** @export {function({loginSpec: !backendApi.LoginSpec})} - Initialized from binding */
    this.onUpdate;
    /** @export {string} */
    this.username = '';
    /** @export {string} */
    this.password = '';
  }

  /** @export */
  clear() {
    this.username = '';
    this.password = '';
    this.onUsernameUpdate();
    this.onPasswordUpdate();
  }

  /** @export */
  $onInit() {
    this.loginOptionsCtrl.addOption(this);
  }

  /** @export */
  onUsernameUpdate() {
    this.onUpdate({loginSpec: new LoginSpec({username: this.username})});
  }

  /** @export */
  onPasswordUpdate() {
    this.onUpdate({loginSpec: new LoginSpec({password: this.password})});
  }
}

/** @type {!angular.Component} */
export const basicLoginComponent = {
  templateUrl: 'login/basic.html',
  require: {
    'loginOptionsCtrl': '^kdLoginOptions',
  },
  bindings: {
    'title': '@',
    'desc': '@',
    'onUpdate': '&',
  },
  controller: BasicLoginController,
};
