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
   * @param {!./state.StateParams} $stateParams
   * * @param {!./../chrome/nav/nav_service.NavService} kdNavService
   *   @param {!../common/appconfig/service.AppConfigService} kdAppConfigService
   * @ngInject
   */
  constructor($stateParams, kdNavService, kdAppConfigService) {
    /** @export {!angular.$http.Response} */
    this.error = $stateParams.error;

    /** @private {!./../chrome/nav/nav_service.NavService} */
    this.kdNavService_ = kdNavService;

    /** @export */
    this.i18n = i18n;

    /**
     * Hide side menu while entering internal error page.
     */
    this.kdNavService_.setVisibility(false);

    /** @private {string} */
    this.dashboardVersion_ = kdAppConfigService.getDashboardVersion();

    /** @private {string} */
    this.gitCommit_ = kdAppConfigService.getGitCommit();
  }

  /**
   * @export
   * @return {string}
   */
  getErrorStatus() {
    let errorStatus = '';
    if (this.error && this.error.statusText && this.error.statusText.length > 0) {
      errorStatus = this.error.statusText;
    } else {
      errorStatus = this.i18n.MSG_UNKNOWN_SERVER_ERROR;
    }

    if (this.error && angular.isNumber(this.error.status) && this.error.status > 0) {
      errorStatus += ` (${this.error.status})`;
    }

    return errorStatus;
  }

  /**
   * @export
   * @return {string}
   */
  getErrorData() {
    if (this.error && this.error.data && this.error.data.length > 0) {
      return this.error.data;
    }
    return this.i18n.MSG_NO_ERROR_DATA;
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
        `issue. It is a good place to use numbered list. -->\n\n\n##### Environment\n\`\`\`\n` +
        `Installation method: \nKubernetes version:\nDashboard version: ` +
        `${this.dashboardVersion_}\nCommit: ${
                                              this.gitCommit_
                                            }\n\`\`\`\n\n\n##### Observed result\n` +
        `Dashboard reported ${this.getErrorStatus()}:\n\`\`\`\n${
                                                                 this.getErrorData()
                                                               }\n\`\`\`\n\n\n` +
        `##### Comments\n<!-- If you have any comments or more details, put them here. -->`;
    return `https://github.com/kubernetes/dashboard/issues/new?title=${encodeURIComponent(title)}` +
        `&body=${encodeURIComponent(body)}`;
  }
}

const i18n = {
  /** @export {string} @desc String to display when error object has invalid structure. */
  MSG_UNKNOWN_SERVER_ERROR: goog.getMsg('Unknown Server Error'),
  /** @export {string} @desc String to display when error object has no data. */
  MSG_NO_ERROR_DATA: goog.getMsg('No error data available'),
};
