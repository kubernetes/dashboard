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

export default class DeployPageObject {
  constructor() {
    this.deployButtonQuery = by.css('.kd-deploy-submit-button');
    this.deployButton = element(this.deployButtonQuery);

    this.appNameFieldQuery = by.model('ctrl.name');
    this.appNameField = element(this.appNameFieldQuery);

    this.containerImageFieldQuery = by.model('ctrl.containerImage');
    this.containerImageField = element(this.containerImageFieldQuery);
  }
}
