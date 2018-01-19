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

import serviceModule from 'service/module';

describe('Service card controller', () => {
  /** @type {!ServiceCardController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(serviceModule.name);

    angular.mock.inject(($componentController, $rootScope) => {
      ctrl = $componentController('kdServiceCard', {$scope: $rootScope}, {});
    });
  });

  it('should return service details link', () => {
    // given
    ctrl.service = {
      objectMeta: {
        name: 'foo-service',
        namespace: 'foo-namespace',
      },
    };

    // then
    expect(ctrl.getServiceDetailHref()).toBe('#!/service/foo-namespace/foo-service');
  });

  it('should return true when service.clusterIP is null', () => {
    // given
    ctrl.service = {
      clusterIP: null,
    };

    // then
    expect(ctrl.isPending()).toBeTruthy();
  });

  it('should return false when service.clusterIP is set', () => {
    // given
    ctrl.service = {
      clusterIP: '10.67.252.103',
    };

    // then
    expect(ctrl.isPending()).toBeFalsy();
  });

  it('should return true when service.type is LoadBalancer AND service.externalEndpoints is null',
     () => {
       // given
       ctrl.service = {
         clusterIP: '10.67.252.103',
         type: 'LoadBalancer',
         externalEndpoints: null,
       };

       // then
       expect(ctrl.isPending()).toBe(true);
     });

  it('should return false when service.type is NodePort AND service.externalEndpoints is null',
     () => {
       // given
       ctrl.service = {
         clusterIP: '10.67.252.103',
         type: 'NodePort',
         externalEndpoints: null,
       };

       // then
       expect(ctrl.isPending()).toBe(false);
     });

  it('should return true when service.type is LoadBalancer AND service.externalEndpoints is set',
     () => {
       // given
       ctrl.service = {
         clusterIP: '10.67.252.103',
         type: 'LoadBalancer',
         externalEndpoints: ['10.64.0.4:80', '10.64.1.5:80', '10.64.2.4:80'],
       };

       // then
       expect(ctrl.isSuccess()).toBeTruthy();
     });

  it('should return true when service.type is NodePort AND service.externalEndpoints is set',
     () => {
       // given
       ctrl.service = {
         clusterIP: '10.67.252.103',
         type: 'NodePort',
         externalEndpoints: ['10.64.0.4:80', '10.64.1.5:80', '10.64.2.4:80'],
       };

       // then
       expect(ctrl.isSuccess()).toBeTruthy();
     });

  it('should return true when service.type is ClusterIP and service.externalEndpoints is null',
     () => {
       // given
       ctrl.service = {
         clusterIP: '10.67.252.103',
         type: 'ClusterIP',
         externalEndpoints: null,
       };

       // then
       expect(ctrl.isSuccess()).toBeTruthy();
     });

  it('should return the service clusterIP when teh clusterIP is set', () => {
    // given
    ctrl.service = {
      clusterIP: '10.67.252.103',
    };

    // then
    expect(ctrl.getServiceClusterIP()).toBe('10.67.252.103');
  });

  it('should return the service clusterIP when teh clusterIP is set', () => {
    // given
    ctrl.service = {
      clusterIP: null,
    };

    // then
    expect(ctrl.getServiceClusterIP()).toBe('-');
  });
});
