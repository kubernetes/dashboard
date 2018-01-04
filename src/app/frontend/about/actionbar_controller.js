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
export class ActionBarController {
  /**
   * @param {!../common/appconfig/service.AppConfigService} kdAppConfigService
   * @ngInject
   */
  constructor(kdAppConfigService) {
    /** @export {string} */
    this.dashboardVersion = kdAppConfigService.getDashboardVersion();

    /** @export {string} */
    this.gitCommit = kdAppConfigService.getGitCommit();
  }

  /**
   * Returns URL of GitHub page used to report bugs with partly filled issue template
   * (check .github/ISSUE_TEMPLATE.md file). IMPORTANT: Remember to keep these templates in sync.
   *
   * @export
   * @return {string} URL of GitHub page used to report bugs.
   */
  getLinkToFeedbackPage() {
    let title = ``;
    let body = `##### Steps to reproduce\n<!-- Describe all steps needed to reproduce the ` +
        `issue. It is a good place to use numbered list. -->\n\n##### Environment\n\`\`\`\n` +
        `Installation method: \nKubernetes version:\nDashboard version: ` +
        `${this.dashboardVersion}\nCommit: ${this.gitCommit}\n\`\`\`\n\n##### Observed result\n` +
        `<!-- Describe observed result as precisely as possible. -->\n\n` +
        `##### Comments\n<!-- If you have any comments or more details, put them here. -->`;
    return `https://github.com/kubernetes/dashboard/issues/new?title=${encodeURIComponent(title)}` +
        `&body=${encodeURIComponent(body)}`;
  }
}
