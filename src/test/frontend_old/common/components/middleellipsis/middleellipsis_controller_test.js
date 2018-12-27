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

describe('Middle ellipsis controller', () => {
  /** @type {!MiddleEllipsisController} */
  let ctrl;
  let element;
  /** @type {!angular.JQLite} */
  beforeEach(() => {
    angular.mock.module(componentsModule.name);

    angular.mock.inject(($componentController) => {
      element = angular.element(
          '<div style="width: 1px;"><span class="kd-middleellipsis-displayStr">Hello World!</span> </div>');
      document.body.appendChild(element[0]);
      ctrl = $componentController('kdMiddleEllipsis', {$element: element});
    });
  });

  it('should initialize controller', () => {
    expect(ctrl).not.toBeNull();
  });

  it('checks if isTruncated logic works', () => {
    expect(ctrl.isTruncated()).toBeTruthy();
  });


  afterEach(() => {
    document.body.removeChild(element[0]);
  });
});
