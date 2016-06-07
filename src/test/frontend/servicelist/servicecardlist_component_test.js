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

import serviceListModule from 'servicelist/servicelist_module';
import serviceDetailModule from 'servicedetail/servicedetail_module';

describe('Service list controller', () => {
  /**
   * @type {!servicelist/servicecardlist_component.ServiceCardListController}
   */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(serviceListModule.name);
    angular.mock.module(serviceDetailModule.name);

    angular.mock.inject(($componentController, $rootScope) => {
      ctrl = $componentController('kdServiceCardList', {$scope: $rootScope}, {});
    });
  });

  it('should return service details link', () => {
    expect(ctrl.getServiceDetailHref({
      objectMeta: {
        name: 'foo-service',
        namespace: 'foo-namespace',
      },
    })).toBe('#/service/foo-namespace/foo-service');
  });

  it('should return true when service.clusterIP is null', () => {
    expect(ctrl.isPending({
      clusterIP: null,
    })).toBeTruthy();
  });

  it('should return false when service.clusterIP is set', () => {
    expect(ctrl.isPending({
      clusterIP: '10.67.252.103',
    })).toBeFalsy();
  });

  it('should return true when service.type is LoadBalancer AND service.externalEndpoints is null',
     () => {
       expect(ctrl.isPending({
         clusterIP: '10.67.252.103',
         type: 'LoadBalancer',
         externalEndpoints: null,
       })).toBeTruthy();
     });

  it('should return true when service.type is NodePort AND service.externalEndpoints is null',
     () => {
       expect(ctrl.isPending({
         clusterIP: '10.67.252.103',
         type: 'NodePort',
         externalEndpoints: null,
       })).toBeTruthy();
     });

  it('should return true when service.type is LoadBalancer AND service.externalEndpoints is set',
     () => {
       expect(ctrl.isSuccess({
         clusterIP: '10.67.252.103',
         type: 'LoadBalancer',
         externalEndpoints: ['10.64.0.4:80', '10.64.1.5:80', '10.64.2.4:80'],
       })).toBeTruthy();
     });

  it('should return true when service.type is NodePort AND service.externalEndpoints is set',
     () => {
       expect(ctrl.isSuccess({
         clusterIP: '10.67.252.103',
         type: 'NodePort',
         externalEndpoints: ['10.64.0.4:80', '10.64.1.5:80', '10.64.2.4:80'],
       })).toBeTruthy();
     });

  it('should return true when service.type is ClusterIP and service.externalEndpoints is null',
     () => {
       expect(ctrl.isSuccess({
         clusterIP: '10.67.252.103',
         type: 'ClusterIP',
         externalEndpoints: null,
       })).toBeTruthy();
     });

  it('should return the service clusterIP when teh clusterIP is set', () => {
    expect(ctrl.getServiceClusterIP({
      clusterIP: '10.67.252.103',
    })).toBe('10.67.252.103');
  });

  it('should return the service clusterIP when teh clusterIP is set', () => {
    expect(ctrl.getServiceClusterIP({
      clusterIP: null,
    })).toBe('-');
  });
});
