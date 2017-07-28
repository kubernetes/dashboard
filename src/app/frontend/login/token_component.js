// Copyright 2017 The Kubernetes Dashboard Authors.
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


class TokenLoginController {
  constructor() {
    this.loginOptionsCtrl;
    this.selected = false;
  }

  $onInit() {
    this.loginOptionsCtrl.addOption(this);
  }

  onTokenUpdate() {
    this.onUpdate({loginSpec: {token: this.token}})
  }
}

export const tokenLoginComponent = {
  templateUrl: 'login/token.html',
  require: {
    'loginOptionsCtrl': '^kdLoginOptions',
  },
  bindings: {
    'title': '@',
    'onUpdate': '&',
  },
  controller: TokenLoginController,
};