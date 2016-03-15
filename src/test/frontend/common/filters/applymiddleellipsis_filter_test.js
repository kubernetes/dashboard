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

import replicationcontrollerlistModule from 'replicationcontrollerlist/replicationcontrollerlist_module';

describe('Apply ellipsis filter', () => {
  const testedString = 'podName';
  beforeEach(function() { angular.mock.module(replicationcontrollerlistModule.name); });

  it('has a applyMiddleEllipsis filter',
     angular.mock.inject(function($filter) { expect($filter('middleEllipsis')).not.toBeNull(); }));

  it('should return the same value if max parameter is undefined',
     angular.mock.inject(function(middleEllipsisFilter) {
       expect(middleEllipsisFilter(testedString)).toEqual('podName');
     }));

  it('should return the same value if length less then given max length parameter',
     angular.mock.inject(function(middleEllipsisFilter) {
       expect(middleEllipsisFilter(testedString, 10)).toEqual('podName');
     }));

  it('should return the same value when max = 0',
     angular.mock.inject(function(middleEllipsisFilter) {
       expect(middleEllipsisFilter(testedString, 0)).toEqual('podName');
     }));

  it('should return truncated value with ellipsis as tail',
     angular.mock.inject(function(middleEllipsisFilter) {
       expect(middleEllipsisFilter(testedString, 1)).toEqual('p...');
     }));

  it('should return truncated value with the ellipsis in the middle',
     angular.mock.inject(function(middleEllipsisFilter) {
       expect(middleEllipsisFilter(testedString, 2)).toEqual('p...e');
     }));

  it('should return truncated value with the ellipsis in the middle',
     angular.mock.inject(function(middleEllipsisFilter) {
       expect(middleEllipsisFilter(testedString, 3)).toEqual('po...e');
     }));

  it('should return truncated value with the ellipsis in the middle',
     angular.mock.inject(function(middleEllipsisFilter) {
       expect(middleEllipsisFilter(testedString, 5)).toEqual('pod...me');
     }));
});
