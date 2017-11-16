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

import resourceModule from 'common/resource/module';

describe('Verber service', () => {
  /** @type {!VerberService} */
  let verber;
  /** @type {!md.$dialog} */
  let mdDialog;
  /** @type {!angular.$q} **/
  let q;
  /** @type {!angular.$scope} **/
  let scope;
  /** @type {!ui.router.State} **/
  let state;
  /** @type {!angular.$log} */
  let log;

  beforeEach(() => {
    angular.mock.module(resourceModule.name, ($provide) => {

      let localizerService = {localize: function() {}};

      $provide.value('localizerService', localizerService);
    });

    angular.mock.inject((kdResourceVerberService, $mdDialog, $q, $rootScope, $state, $log) => {
      verber = kdResourceVerberService;
      mdDialog = $mdDialog;
      q = $q;
      scope = $rootScope.$new();
      state = $state;
      log = $log;
    });
  });


  it('should show delete dialog resource', (doneFn) => {
    let deferred = q.defer();
    spyOn(mdDialog, 'show').and.returnValue(deferred.promise);

    let promise = verber.showDeleteDialog('Foo resource', {kind: 'bar'}, {name: 'qux'});

    expect(mdDialog.show).toHaveBeenCalledWith(jasmine.objectContaining({
      locals: {
        'resourceKindName': 'Foo resource',
        'resourceUrl': 'api/v1/_raw/bar/name/qux',
        'objectMeta': {name: 'qux'},
      },
    }));

    deferred.resolve();
    promise.then(doneFn);
    scope.$digest();
  });

  it('should show alert window on delete error', (doneFn) => {
    let deferred = q.defer();
    spyOn(mdDialog, 'show').and.returnValue(deferred.promise);
    spyOn(state, 'reload');
    spyOn(mdDialog, 'alert').and.callThrough();
    let promise = verber.showDeleteDialog('', {}, {}).catch((err) => {
      log.error('Error showing delete dialog:', err);
    });

    deferred.reject({data: 'foo-data', statusText: 'foo-text'});
    deferred.promise.catch(doneFn);
    scope.$digest();
    expect(state.reload).not.toHaveBeenCalled();
    expect(mdDialog.alert).toHaveBeenCalled();

    deferred.resolve();
    promise.catch(doneFn);
    scope.$digest();
  });

  it('should show edit dialog resource', (doneFn) => {
    let deferred = q.defer();
    spyOn(mdDialog, 'show').and.returnValue(deferred.promise);

    let promise =
        verber.showEditDialog('Foo resource', {kind: 'bar'}, {name: 'qux', namespace: 'foo'});

    expect(mdDialog.show).toHaveBeenCalledWith(jasmine.objectContaining({
      locals: {
        'resourceKindName': 'Foo resource',
        'resourceUrl': 'api/v1/_raw/bar/namespace/foo/name/qux',
      },
    }));
    deferred.resolve();
    promise.then(doneFn);
    scope.$digest();
  });

  it('should show alert window on edit error', (doneFn) => {
    let deferred = q.defer();
    spyOn(mdDialog, 'show').and.returnValue(deferred.promise);
    spyOn(state, 'reload');
    spyOn(mdDialog, 'alert').and.callThrough();
    let promise = verber.showEditDialog('Foo resource', {kind: 'bar'}, {}).catch((err) => {
      log.error('Error showing edit dialog:', err);
    });

    deferred.reject({data: 'foo-data', statusText: 'foo-text'});
    deferred.promise.catch(doneFn);
    scope.$digest();
    expect(state.reload).not.toHaveBeenCalled();
    expect(mdDialog.alert).toHaveBeenCalled();

    deferred.resolve();
    promise.catch(doneFn);
    scope.$digest();
  });
});
