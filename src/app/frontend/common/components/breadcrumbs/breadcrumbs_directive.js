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

import BreadcrumbsController from './breadcrumbs_controller';

/**
 * Returns directive definition for breadcrumbs.
 *
 * In order to define custom label for the state add: `'kdBreadcrumbs':{'label':'myLabel'}`
 * to the state config. This label will be used instead of default state name when displaying
 * breadcrumbs.
 *
 * In order to define custom parent for the state add: `'kdBreadcrumbs`:{'parent':'myParentState'}`
 * to the state config. Parent state will be looked up by this name if it's defined.
 *
 * Additionally labels can be interpolated. This applies only to the last state in the
 * breadcrumb chain, i.e. for given state chain `StateA > StateB > StateC`, only StateC can use
 * following convention: `'kdBreadcrumbs`:{'label':'{{$stateParams.paramX}}'}`
 *
 * Example state config:
 * $stateProvider.state(stateName, {
 *   url: '...',
 *   'kdBreadcrumbs': {
 *     'label': '{{$stateParams.paramX}}',
 *     'parent': 'parentState',
 *   },
 *   views: {
 *     '': {
 *       controller: SomeCtrlA,
 *       controllerAs: 'ctrl',
 *       templateUrl: '...',
 *     },
 *     'actionbar': {
 *       controller: SomeCtrlB,
 *       controllerAs: 'ctrl',
 *       templateUrl: '...',
 *     },
 *   },
 * });
 *
 * @return {!angular.Directive}
 */
export default function breadcrumbsDirective() {
  return {
    restrict: 'AE',
    controller: BreadcrumbsController,
    controllerAs: 'ctrl',
    templateUrl: 'common/components/breadcrumbs/breadcrumbs.html',
    bindToController: {
      'limit': '@',
      'separator': '@',
    },
  };
}
