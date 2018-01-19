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

import ingressModule from 'ingress/module';

describe('Ingress Card List controller', () => {
  /**
   * @type {!IngressCardListController}
   */
  let ctrl;
  /**
   * @type {!NamespaceService}
   */
  let data;

  beforeEach(() => {
    angular.mock.module(ingressModule.name);

    angular.mock.inject(($componentController, kdNamespaceService) => {
      /** @type {!NamespaceService} */
      data = kdNamespaceService;
      /** @type {!IngressListController} */
      ctrl = $componentController('kdIngressCardList', {kdNamespaceService_: data});
    });
  });

  it('should instantiate the controller properly', () => {
    expect(ctrl).not.toBeUndefined();
  });

  it('should return the value from Namespace service', () => {
    expect(ctrl.areMultipleNamespacesSelected()).toBe(data.areMultipleNamespacesSelected());
  });

  it('should return correct select id', () => {
    // given
    let expected = 'ingresses';
    ctrl.ingressList = {};
    ctrl.ingressListResource = {};

    // when
    let got = ctrl.getSelectId();

    // then
    expect(got).toBe(expected);
  });

  it('should return empty select id', () => {
    // given
    let expected = '';

    // when
    let got = ctrl.getSelectId();

    // then
    expect(got).toBe(expected);
  });
});
