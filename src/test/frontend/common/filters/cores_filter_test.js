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

import filtersModule from 'common/filters/filters_module';

describe('Cores filter', () => {
  /** @type {function(!number):string} */
  let filter;

  beforeEach(() => {
    angular.mock.module(filtersModule.name);
    angular.mock.inject((_kdCoresFilter_) => { filter = _kdCoresFilter_; });
  });

  it('should format CPU', () => {
    expect(filter(0)).toEqual('0 mCPU');
    expect(filter(1)).toEqual('1 mCPU');
    expect(filter(2)).toEqual('2 mCPU');
    expect(filter(1000)).toEqual('1,000 mCPU');
    expect(filter(1024)).toEqual('1.024 CPU');
    expect(filter(1025)).toEqual('1.025 CPU');
    expect(filter(7896)).toEqual('7.896 CPU');
    expect(filter(109809)).toEqual('109.809 CPU');
    expect(filter(768689899)).toEqual('768.690 kCPU');
    expect(filter(768689899789)).toEqual('768.690 MCPU');
    expect(filter(76868989978978)).toEqual('76.869 GCPU');
    expect(filter(7686898997897878)).toEqual('7,686.899 GCPU');
  });
});
