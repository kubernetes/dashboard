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

import {ActionBarController} from 'about/actionbar_controller';
import module from 'about/module';
import appconfig_module from 'common/appconfig/module';

describe('About actionbar controller', () => {
  /** @type {!about/actionbar_controller.ActionBarController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(module.name);
    angular.mock.module(appconfig_module.name);
    angular.mock.inject(($controller, kdAppConfigService) => {
      ctrl = $controller(ActionBarController, {
        'kdAppConfigService': kdAppConfigService,
      });
    });
  });

  it('should create github link with all environment information', () => {
    ctrl.dashboardVersion = 'v10.0';
    ctrl.gitCommit = '23dd7085953f7aeef15b13dba90fb21b88d772aa';
    let url = ctrl.getLinkToFeedbackPage();
    expect(url.indexOf('https://github.com') === 0).toBeTruthy();
    expect(url.indexOf('v10.0') > 0).toBeTruthy();
    expect(url.indexOf('23dd7085953f7aeef15b13dba90fb21b88d772aa') > 0).toBeTruthy();
  });

});
