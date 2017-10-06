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

import {JobListController} from 'job/list/controller';
import jobModule from 'job/module';

describe('Job list controller', () => {

  beforeEach(() => {
    angular.mock.module(jobModule.name);
  });

  it('should initialize job controller', angular.mock.inject(($controller) => {
    let ctrls = {};
    /** @type {!JobListController} */
    let ctrl = $controller(JobListController, {jobList: {jobs: ctrls}});

    expect(ctrl.jobList.jobs).toBe(ctrls);
  }));
});
