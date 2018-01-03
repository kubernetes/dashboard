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
export default class DeploymentInfoController {
  /**
   * Constructs deployment info object.
   */
  constructor() {
    /**
     * Deployment details. Initialized from the scope.
     * @export {!backendApi.DeploymentDetail}
     */
    this.deployment;
  }

  /**
   * Returns true if the deployment strategy is RollingUpdate
   * @return {boolean}
   * @export
   */
  rollingUpdateStrategy() {
    return this.deployment.strategy === 'RollingUpdate';
  }
}

/**
 * Definition object for the component that displays replica set info.
 *
 * @type {!angular.Component}
 */
export const deploymentInfoComponent = {
  controller: DeploymentInfoController,
  templateUrl: 'deployment/detail/info.html',
  bindings: {
    /** {!backendApi.DeploymentDetail} */
    'deployment': '=',
  },
};
