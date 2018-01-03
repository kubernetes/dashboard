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

/** @final */
class WorkloadStatusesController {
  constructor() {
    /** @export {!Array<string>} */
    this.colorPalette = ['#00c752', '#f00', '#ffad20', '#006028'];
  }
}

/** @return {!angular.Component} */
export const workloadStatusesComponent = {
  bindings: {
    'resourcesRatio': '<',
  },
  controller: WorkloadStatusesController,
  templateUrl: 'overview/workloadstatuses/workloadstatuses.html',
};
