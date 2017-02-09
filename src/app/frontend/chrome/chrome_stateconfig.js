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

import {actionbarViewName, namespaceParam, stateName, toolbarViewName} from './chrome_state';

/**
 * Namespace is an abstract state with no path, but with one parameter ?namespace= that
 * is always accepted (since namespace is above all).
 *
 * This state must always be the root in a state tree. This is enforced during app startup.
 *
 * @param {!ui.router.$stateProvider|kdUiRouter.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: `?${namespaceParam}`,
    abstract: true,
    resolve: {
      // As this is abstract view without actual controller, we can't resolve and pass data to it.
      // We are enforcing service initialization and thanks to resolve main view will wait until
      // service data is resolved. It is used to dynamically build third party resources nav menu.
      getThirdPartyResourceList,
    },
    views: {
      '': {
        template: '<div ui-view class="kd-content-div-filled"></div>',
      },
      [toolbarViewName]: {
        template: `<div ui-view="${toolbarViewName}"></div>`,
      },
      [actionbarViewName]: {
        template: `<div ui-view="${actionbarViewName}" layout="row"></div>`,
      },
    },
  });
  $stateProvider.decorator('parent', requireParentState);
}

/**
 * @param {!Object} stateExtend
 * @param {function(?):!ui.router.$state} parentFn
 * @return {!ui.router.$state}
 */
function requireParentState(stateExtend, parentFn) {
  /** @type {!ui.router.$state} */
  let state = stateExtend['self'];
  if (!state.parent && state.name !== stateName) {
    throw new Error(
        `State "${state.name}" requires parent state to be set to ` +
        `${stateName}. This is likely a programming error.`);
  }
  return parentFn(stateExtend);
}

/**
 * @param {!./../common/thirdpartyresource/thirdpartyresource_service.ThirdPartyResourceService}
 * kdThirdPartyResourceService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
function getThirdPartyResourceList(kdThirdPartyResourceService) {
  return kdThirdPartyResourceService.resolve();
}
