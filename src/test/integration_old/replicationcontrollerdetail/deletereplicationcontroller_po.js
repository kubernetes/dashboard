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

export default class DeleteReplicationControllerDialogObject {
  constructor() {
    this.deleteAppButtonQuery = by.css('.kd-delete-btn');
    this.deleteAppButton = element(this.deleteAppButtonQuery);

    this.deleteServicesCheckboxQuery = by.css('.kd-deletedialog-services-checkbox');
    this.deleteServicesCheckbox = element(this.deleteServicesCheckboxQuery);
  }
}
