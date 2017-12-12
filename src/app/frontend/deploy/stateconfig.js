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

import {stateName as parentState} from '../chrome/state';
import {breadcrumbsConfig} from '../common/components/breadcrumbs/service';

import {stateName, stateUrl} from './state';

/**
 * Configures states for the deploy view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    parent: parentState,
    url: stateUrl,
    views: {
      '': {
        templateUrl: 'deploy/deploy.html',
      },
    },
    data: {
      [breadcrumbsConfig]: {
        'label': i18n.MSG_BREADCRUMBS_DEPLOY_APP_LABEL,
      },
    },
  });
}

const i18n = {
  /** @type {string} @desc Breadcrumb label for the deploy view. */
  MSG_BREADCRUMBS_DEPLOY_APP_LABEL: goog.getMsg('Resource creation'),
};
