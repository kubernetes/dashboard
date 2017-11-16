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

import {breadcrumbsConfig} from 'common/components/breadcrumbs/service';
import componentsModule from 'common/components/module';

describe('Actionbar delete item component', () => {
  /** @type {BreadcrumbsController} */
  let ctrl;
  /** @type {ui.router.$state} */
  let state;
  /** @type !{!common/resource/verber_service.VerberService} */
  let kdResourceVerberService;
  /** @type {!angular.$q} **/
  let q;
  /** @type {!angular.$scope} **/
  let scope;
  /** {ui.router.$globals} */
  let globals;

  /**
   * Create simple mock object for state.
   *
   * @param {string} stateName
   * @param {string} stateLabel
   * @param {string} stateParent
   * @return {{name: string, kdBreadcrumbs: {label: string}}}
   */
  function getStateMock(stateName, stateLabel, stateParent) {
    return {
      name: stateName,
      data: {
        [breadcrumbsConfig]: {
          label: stateLabel,
          parent: stateParent,
        },
      },
    };
  }

  beforeEach(() => {
    angular.mock.module(componentsModule.name, ($provide) => {

      let localizerService = {localize: function() {}};

      $provide.value('localizerService', localizerService);
    });

    angular.mock.inject(
        ($componentController, $state, _kdBreadcrumbsService_, _kdResourceVerberService_, $q,
         $rootScope, $uiRouterGlobals, localizerService) => {
          state = $state;
          globals = $uiRouterGlobals;
          kdResourceVerberService = _kdResourceVerberService_;
          q = $q;
          scope = $rootScope.$new();
          ctrl = $componentController(
              'kdActionbarDeleteItem', {
                $state: state,
                kdBreadcrumbsService: _kdBreadcrumbsService_,
                kdResourceVerberService: _kdResourceVerberService_,
                $scope: scope,
                localizerService: localizerService,
              },
              {
                resourceKindName: 'resource',
                typeMeta: {},
                objectMeta: {},
              });
        });
  });

  it('should go to parent state on delete success', () => {
    // given
    let deferred = q.defer();
    let httpStatusOk = 200;
    spyOn(kdResourceVerberService, 'showDeleteDialog').and.returnValue(deferred.promise);
    spyOn(state, 'go');
    globals.$current = getStateMock('testState', 'testLabel', 'testParent');

    // when
    ctrl.remove();
    deferred.resolve(httpStatusOk);
    scope.$digest();

    // then
    expect(state.go).toHaveBeenCalledWith('testParent');
  });
});
