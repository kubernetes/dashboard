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

/**
 * @final
 */
export class InternalErrorController {
  /**
   * @param {!./internalerror_state.StateParams} $stateParams
   * @ngInject
   */
  constructor($stateParams) {
    /** @export {!angular.$http.Response} */
    this.error = $stateParams.error;
  }

  /**
   * @export
   * @return {boolean}
   */
  showStatus() {
    return angular.isNumber(this.error.status) && this.error.status > 0;
  }

  /**
   * Returns URL of GitHub page used to report bugs with partly filled issue template
   * (check .github/ISSUE_TEMPLATE.md file)
   *
   * @export
   * @return {string} URL of GitHub page used to report bugs.
   */
  getLinkToFeedbackPage() {
    let link = 'https://github.com/kubernetes/dashboard/issues/new';

    if (this.error) {
      let title = `Dashboard reported ${this.error.statusText} (${this.error.status})`;
      let body = `#### Issue details\n\n##### Environment\n<!-- Describe how do you run ` +
          `Kubernetes and Dashboard.\n      Versions of Node.js, Go etc. are needed only from ` +
          `developers.To get them use console:\n      $ node --version\n      $ go version\n-->\n` +
          `\n\`\`\`\nDashboard version:\nKubernetes version:\nOperating system:\nNode.js version:` +
          `\nGo version:\n\`\`\`\n##### Steps to reproduce\n<!-- Describe all steps needed to ` +
          `reproduce the issue. It is a good place to use numbered list. -->\n\n##### Observed ` +
          `result\nDashboard reported ${this.error.statusText} (${this.error.status}):\n\`\`\`\n` +
          `${this.error.data}\n\`\`\`\n\n##### Expected result\n<!-- Describe expected result ` +
          `as precisely as possible. -->\n\n##### Comments\n<!-- If you have any comments or more` +
          ` details, put them here. -->`;

      link += `?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    }

    return link;
  }
}
