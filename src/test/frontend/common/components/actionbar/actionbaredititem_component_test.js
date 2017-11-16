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

import componentsModule from 'common/components/module';

describe('Actionbar edit item component', () => {
  /** @type {BreadcrumbsController} */
  let ctrl;
  /** @type {ui.router.$state} */
  let state;
  /** @type !{!common/resource/service.VerberService} */
  let kdResourceVerberService;
  /** @type {!angular.$q} **/
  let q;
  /** @type {!angular.$scope} **/
  let scope;

  beforeEach(() => {
    angular.mock.module(componentsModule.name, ($provide) => {

      let localizerService = {localize: function() {}};

      $provide.value('localizerService', localizerService);
    });

    let fakeModule = angular.module('fakeModule', []);
    fakeModule.config(($stateProvider) => {
      $stateProvider.state('fakeState', {
        url: 'fakeStateUrl',
        template: '<ui-view>Foo</ui-view>',
      });
    });
    angular.mock.module(fakeModule.name);

    angular.mock.inject(
        ($componentController, $state, _kdResourceVerberService_, $q, $rootScope,
         localizerService) => {
          state = $state;
          kdResourceVerberService = _kdResourceVerberService_;
          q = $q;
          scope = $rootScope.$new();
          ctrl = $componentController(
              'kdActionbarEditItem', {
                $scope: scope,
                localizerService: localizerService,
              },
              {
                resourceKindName: 'resource',
                typeMeta: {},
                objectMeta: {},
              });
          state.go('fakeState');
          scope.$digest();
        });
  });

  it('should refresh on success', () => {
    // given
    let deferred = q.defer();
    let httpStatusOk = 200;
    spyOn(kdResourceVerberService, 'showEditDialog').and.returnValue(deferred.promise);
    spyOn(state, 'reload');

    // when
    ctrl.edit();
    deferred.resolve(httpStatusOk);
    scope.$digest();

    // then
    expect(state.reload).toHaveBeenCalled();
  });
});
