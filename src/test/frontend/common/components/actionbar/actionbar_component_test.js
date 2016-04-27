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

  it('should add shadow on scroll',
     angular.mock.inject(($rootScope, $window, $document, $compile) => {
       let elem = $compile('<kd-actionbar></kd-actionbar>')($rootScope);

       // Start with no state.
       expect(elem[0].classList).not.toContain('kd-actionbar-not-scrolled');

       $rootScope.$digest();
       // On initial load go with not scrolled state.
       expect(elem[0].classList).toContain('kd-actionbar-not-scrolled');

       $window.scrollY = 70;
       $document.trigger('scroll');
       $rootScope.$digest();
       // Now it is scrolled
       expect(elem[0].classList).not.toContain('kd-actionbar-not-scrolled');

       $window.scrollY = 0;
       $document.trigger('scroll');
       $rootScope.$digest();
       // Go back.
       expect(elem[0].classList).toContain('kd-actionbar-not-scrolled');

       $rootScope.$destroy();
       $window.scrollY = 70;
       $document.trigger('scroll');
       $rootScope.$digest();
       // After $destroy - nothing happens.
       expect(elem[0].classList).toContain('kd-actionbar-not-scrolled');
     }));
});
