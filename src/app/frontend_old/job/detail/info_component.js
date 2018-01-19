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

/**
 * @final
 */
export default class JobInfoController {
  /**
   * Constructs replication controller info object.
   */
  constructor() {
    /**
     * Job details. Initialized from the scope.
     * @export {!backendApi.JobDetail}
     */
    this.job;
  }
}

/**
 * Definition object for the component that displays job info.
 *
 * @return {!angular.Component}
 */
export const jobInfoComponent = {
  controller: JobInfoController,
  templateUrl: 'job/detail/info.html',
  bindings: {
    /** {!backendApi.JobDetail} */
    'job': '=',
  },
};
