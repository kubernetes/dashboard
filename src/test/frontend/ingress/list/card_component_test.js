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

import ingressModule from 'ingress/module';

describe('Ingress card', () => {
  /**
   * @type {!IngressCardController}
   */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(ingressModule.name);

    angular.mock.inject(($componentController, $rootScope) => {
      ctrl = $componentController('kdIngressCard', {$scope: $rootScope}, {
        ingress: {
          objectMeta: {
            namespace: 'foo',
            name: 'bar',
          },
        },
      });
    });
  });

  it('should handle multiple namespaces', () => {
    expect(ctrl.areMultipleNamespacesSelected()).toBe(false);
    spyOn(ctrl.kdNamespaceService_, 'areMultipleNamespacesSelected').and.returnValue(true);
    expect(ctrl.areMultipleNamespacesSelected()).toBe(true);
  });

  it('should format the "ingress start date" tooltip correctly', () => {
    expect(ctrl.getStartedAtTooltip('2016-06-06T09:13:12Z'))
        .toBe('Created at 2016-06-06T09:13 UTC');
  });

  it('should return details href', () => {
    expect(ctrl.getIngressDetailHref()).toBe('#!/ingress/foo/bar');
  });
});
