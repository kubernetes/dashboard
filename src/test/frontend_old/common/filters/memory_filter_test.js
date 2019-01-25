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

import filtersModule from 'common/filters/module';

describe('Memory filter', () => {
  /** @type {function(!number):string} */
  let memoryFilter;

  beforeEach(() => {
    angular.mock.module(filtersModule.name);
    angular.mock.inject((_kdMemoryFilter_) => {
      memoryFilter = _kdMemoryFilter_;
    });
  });

  it('should format memory', () => {
    expect(memoryFilter(0)).toEqual('0');
    expect(memoryFilter(1)).toEqual('1');
    expect(memoryFilter(2)).toEqual('2');
    expect(memoryFilter(1000)).toEqual('1,000');
    expect(memoryFilter(1024)).toEqual('1,024');
    expect(memoryFilter(1025)).toEqual('1.001 Ki');
    expect(memoryFilter(7896)).toEqual('7.711 Ki');
    expect(memoryFilter(109809)).toEqual('107.235 Ki');
    expect(memoryFilter(768689899)).toEqual('733.080 Mi');
    expect(memoryFilter(768689899789)).toEqual('715.898 Gi');
    expect(memoryFilter(76868989978978)).toEqual('69.912 Ti');
    expect(memoryFilter(7686898997897878)).toEqual('6.827 Pi');
    expect(memoryFilter(768689899789787867898766)).toEqual('682,733,780.435 Pi');
  });
});
