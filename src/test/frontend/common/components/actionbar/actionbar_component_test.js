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

import actionbarCardModule from 'common/components/actionbar/actionbar_module';

describe('Action bar', () => {
  beforeEach(() => angular.mock.module(actionbarCardModule.name));

  it('should add shadow on scroll', angular.mock.inject(($rootScope, $compile) => {
    let elem = $compile(`
           <div>
             <kd-actionbar></kd-actionbar>
             <md-content>foo</md-content>
           </div>`)($rootScope);

    let mdContent = elem.find('md-content');
    let actionbar = elem.find('kd-actionbar');

    // Start with no state.
    expect(actionbar[0].classList).not.toContain('kd-actionbar-not-scrolled');

    $rootScope.$digest();
    let abCtrl = actionbar.controller('kdActionbar');
    // On initial load go with not scrolled state.
    expect(actionbar[0].classList).toContain('kd-actionbar-not-scrolled');

    abCtrl.computeScrollClass_({scrollTop: 1});
    // Now it is scrolled
    expect(actionbar[0].classList).not.toContain('kd-actionbar-not-scrolled');

    mdContent.trigger('scroll');
    $rootScope.$digest();
    // Go back.
    expect(actionbar[0].classList).toContain('kd-actionbar-not-scrolled');

    $rootScope.$destroy();
    mdContent.trigger('scroll');
    $rootScope.$digest();
    // After $destroy - nothing happens.
    expect(actionbar[0].classList).toContain('kd-actionbar-not-scrolled');
  }));

  it('should throw an error on no content', angular.mock.inject(($rootScope, $compile) => {
    $compile('<kd-actionbar></kd-actionbar>')($rootScope);
    expect(() => { $rootScope.$digest(); }).toThrow();
  }));
});
