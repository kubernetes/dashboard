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

import nodeListModule from 'nodelist/nodelist_module';

describe('Node card list controller', () => {

  beforeEach(() => {
    angular.mock.module(nodeListModule.name);
  });

  it('should initialize node card list controller', angular.mock.inject(($componentController) => {
    // given
    let ctrl = $componentController('kdNodeCardList', {});

    // then
    expect(ctrl).toBeDefined();
  }));
});
