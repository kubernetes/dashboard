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

import errorModule from 'error/error_module';

describe('Error module', () => {
  beforeEach(angular.mock.module(errorModule.name));

  it('should register route error handlers', angular.mock.inject(($rootScope, $state) => {
    // given
    let error = {error: 'bar'};
    expect($state.current.name).toBe('');

    // when
    $rootScope.$broadcast('$stateChangeError', null, null, null, null, error);
    $rootScope.$apply();

    // then
    expect($state.current.name).toBe('internalerror');
  }));
});
