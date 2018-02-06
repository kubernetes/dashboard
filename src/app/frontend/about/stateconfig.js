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


import {actionbarViewName, stateName as chromeStateName} from '../chrome/state';
import {breadcrumbsConfig} from '../common/components/breadcrumbs/service';

import {ActionBarController} from './actionbar_controller';
import {AboutController} from './controller';
import {stateName, stateUrl} from './state';

/**
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: stateUrl,
    parent: chromeStateName,
    views: {
      '': {
        controller: AboutController,
        controllerAs: '$ctrl',
        templateUrl: 'about/about.html',
      },
      [`${actionbarViewName}@${chromeStateName}`]: {
        controller: ActionBarController,
        controllerAs: '$ctrl',
        templateUrl: 'about/actionbar.html',
      },
    },
    data: {
      [breadcrumbsConfig]: {
        'label': i18n.MSG_BREADCRUMBS_ABOUT_LABEL,
      },
    },
  });
}

const i18n = {
  /** @type {string} @desc Label 'About' that appears as a breadcrumbs on the action bar. */
  MSG_BREADCRUMBS_ABOUT_LABEL: goog.getMsg('About'),
};
