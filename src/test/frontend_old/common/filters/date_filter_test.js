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

describe('Items per page filter', () => {
  /** @type {function(string, string, string): string} */
  let dateFilter;

  beforeEach(() => {
    angular.mock.module(filtersModule.name);

    angular.mock.inject((_dateFilter_) => {
      dateFilter = _dateFilter_;
    });
  });

  it('should format date with a default format', () => {
    expect(dateFilter('2016-06-06T19:13:12Z')).toEqual('2016-06-06T19:13 UTC');
  });
  it('should format date with an explicit format', () => {
    expect(dateFilter('2016-06-06T19:13:12Z', 'yyyy-MM-ddThh:mm:ss'))
        .toEqual('2016-06-06T07:13:12');
  });
  it('should format date with an explicit timezone', () => {
    expect(dateFilter('2016-06-06T19:13:12Z', null, '+0200')).toEqual('2016-06-06T21:13');
  });
});
