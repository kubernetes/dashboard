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

import replicaSetDetailModule from 'replicasetdetail/replicasetdetail_module';

describe('Replica set service', () => {
  /** @type {!ReplicaSetService} */
  let service;
  /** @type {!md.$dialog} */
  let mdDialog;
  /** @type {!angular.$q} */
  let q;
  /** @type {!angular.$httpBackend} */
  let httpBackend;

  beforeEach(() => {
    angular.mock.module(replicaSetDetailModule.name);

    angular.mock.inject((kdReplicaSetService, $mdDialog, $q, $httpBackend) => {
      service = kdReplicaSetService;
      mdDialog = $mdDialog;
      q = $q;
      httpBackend = $httpBackend;
    });
  });

  it('should show delete dialog and delete object', (doneFn) => {
    // given
    let deferred = q.defer();
    spyOn(mdDialog, 'show').and.returnValue(deferred.promise);
    httpBackend.when('DELETE', 'api/replicasets/foo-namespace/foo-name').respond({});

    // when
    let promise = service.showDeleteDialog('foo-namespace', 'foo-name');

    // then
    promise.then(doneFn, () => { doneFn(new Error()); });
    deferred.resolve();
    httpBackend.flush();
  });

  it('should show delete dialog and forward errors', (doneFn) => {
    // given
    let deferred = q.defer();
    spyOn(mdDialog, 'show').and.returnValue(deferred.promise);
    httpBackend.when('DELETE', 'api/replicasets/foo-namespace/foo-name').respond(404, 'Error');

    // when
    let promise = service.showDeleteDialog('foo-namespace', 'foo-name');

    // then
    promise.then(() => { doneFn(new Error()); }, doneFn);
    deferred.resolve();
    httpBackend.flush();
  });

  it('should show edit replicas dialog', () => {
    // given
    let namespace = 'foo-namespace';
    let replicaSet = 'foo-name';
    let currentPods = 3;
    spyOn(mdDialog, 'show');

    // when
    service.showUpdateReplicasDialog(namespace, replicaSet, currentPods, currentPods);

    // then
    expect(mdDialog.show).toHaveBeenCalled();
  });
});
