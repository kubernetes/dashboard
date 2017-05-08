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

import {stateName as chromeStateName} from 'chrome/state';
import {breadcrumbsConfig} from 'common/components/breadcrumbs/service';

import {stateUrl} from './../state';
import {ThirdPartyResourceListController} from './controller';

/**
 * I18n object that defines strings for translation used in this file.
 */
const i18n = {
  /** @type {string} @desc Label 'Third Party Resources' that appears as a breadcrumbs on the
   action bar. */
  MSG_BREADCRUMBS_THIRD_PARTY_RESOURCES_LABEL: goog.getMsg('Third Party Resources'),
};

/**
 * Config state object for the Third Party Resource list view.
 *
 * @type {!ui.router.StateConfig}
 */
export const config = {
  url: stateUrl,
  parent: chromeStateName,
  resolve: {
    'thirdPartyResourceList': resolveThirdPartyResourceList,
  },
  data: {
    [breadcrumbsConfig]: {
      'label': i18n.MSG_BREADCRUMBS_THIRD_PARTY_RESOURCES_LABEL,
      'parent': '',
    },
  },
  views: {
    '': {
      controller: ThirdPartyResourceListController,
      controllerAs: '$ctrl',
      templateUrl: 'thirdpartyresource/list/list.html',
    },
  },
};

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
export function thirdPartyResourceListResource($resource) {
  return $resource('api/v1/thirdpartyresource');
}

/**
 * @param {!angular.Resource} kdThirdPartyResourceListResource
 * @param {!./../../common/dataselect/service.DataSelectService} kdDataSelectService
 * @returns {!angular.$q.Promise}
 * @ngInject
 */
export function resolveThirdPartyResourceList(
    kdThirdPartyResourceListResource, kdDataSelectService) {
  let query = kdDataSelectService.getDefaultResourceQuery();
  return kdThirdPartyResourceListResource.get(query).$promise;
}
