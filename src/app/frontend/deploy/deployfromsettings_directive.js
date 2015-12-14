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

import DeployFromSettingsController from './deployfromsettings_controller';

/**
 * Returns directive definition object for the deploy from settings directive.
 * @return {!angular.Directive}
 */
export default function deployFromSettingsDirective() {
  return {
    scope: {},
    bindToController: {
      'name': '=',
      'namespace': '=',
      'detail': '=',
    },
    controller: DeployFromSettingsController,
    controllerAs: 'ctrl',
    templateUrl: 'deploy/deployfromsettings.html',
  };
}
