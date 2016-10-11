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

import {stateName as workloads} from 'workloads/workloads_state';

/**
 * Controller for the deploy from file directive.
 *
 * @final
 */
export default class DeployFromChartController {
  /**
   * @param {!angular.$log} $log
   * @param {!angular.$resource} $resource
   * @param {!angular.$q} $q
   * TODO (cheld) Set correct type after fixing issue #159
   * @param {!Object} errorDialog
   * @param {!./../common/history/history_service.HistoryService} kdHistoryService
   * @ngInject
   */
  constructor($log, $resource, $q, errorDialog, kdHistoryService) {
    /**
     * Initialized the template.
     * @export {!angular.FormController}
     */
    this.form;

    /**
     * Custom file model for the selected file
     *
     * @export {{name:string, content:string}}
     */
    this.file = {name: '', content: ''};

    /** @private {!angular.$q} */
    this.q_ = $q;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /**
     * TODO (cheld) Set correct type after fixing issue #159
     * @private {!Object}
     */
    this.errorDialog_ = errorDialog;

    /** @private {boolean} */
    this.isDeployInProgress_ = false;

    /** @private {!./../common/history/history_service.HistoryService} */
    this.kdHistoryService_ = kdHistoryService;

    /** @export */
    this.i18n = i18n;

    /** @export */
    this.selectedClass = "kd-chart-card-selected";

    /** @export */
    this.selectedChart = "";

    /**
     * @export {string}
     */
    this.name = "";

    /**
     * List of available repository.
     * @export {!Array<string>}
     */
    this.repos = [];

    /** Init the list of available repos **/
    this.getRepos();

    /** @export */
    this.selectedRepo = "";

    /**
     * List of available charts.
     * @export {!Array<string>}
     */
    this.charts = [];

  }

  /**
   * Deploys the application based on the state of the controller.
   *
   * @export
   */
  deploy() {
    if (this.form.$valid) {
      /** @type {!backendApi.AppDeploymentFromChartSpec} */
      let deploymentSpec = {
        chartURL: this.selectedChart,
        releaseName: this.name,
        namespace: "default",
      };
      let defer = this.q_.defer();

      /** @type {!angular.Resource<!backendApi.AppDeploymentFromChartSpec>} */
      let resource = this.resource_('api/v1/appdeploymentfromchart');
      this.isDeployInProgress_ = true;
      resource.save(
          deploymentSpec,
          (response) => {
            defer.resolve(response);  // Progress ends
            this.log_.info('Chart deployment completed: ', response);
            if (response.error > 0) {
              this.errorDialog_.open('Chart deployment has partly completed', response.error);
            }
            this.kdHistoryService_.back(workloads);
          },
          (err) => {
            defer.reject(err);  // Progress ends
            this.log_.error('Error deploying chart:', err);
            this.errorDialog_.open('Deploying chart has failed', err.data);
          });
      defer.promise.finally(() => { this.isDeployInProgress_ = false; });
    }
  }

  /**
   * Returns true when the deploy action should be enabled.
   * @return {boolean}
   * @export
   */
  isDeployDisabled() { return this.isDeployInProgress_; }

  /**
   * Cancels the deployment form.
   * @export
   */
  cancel() { this.kdHistoryService_.back(workloads); }

  /**
   * Queries all avialable repos.
   * @export
   */
  getRepos() {
    /** @type {!angular.Resource<!backendApi.RepositoryList>} */
    let resource = this.resource_(`api/v1/repository`);
    resource.get(
        (res) => { this.repos = ["None"].concat(res.repoNames); },
        (err) => { this.log_.log(`Error getting repos: ${err}`); });
  }

  /**
   * Queries all charts for a given repo.
   * @param {string} repo
   * @export
   */
  getCharts(repo) {
    /** @type {!angular.Resource<!backendApi.ChartList>} */
    let resource = this.resource_(`api/v1/repository/${repo}`);
    resource.get(
        (res) => { this.charts = res.charts.sort(
                      function(a, b) {
                        var nameA = a.name.toUpperCase();
                        var nameB = b.name.toUpperCase();
                        return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
                    }); },
        (err) => { this.log_.log(`Error getting charts: ${err}`); });
  }

  /**
   * Selects a chart repository.
   * @export
   */
  selectRepo(repoName) {
    if (repoName == "None") {
      this.charts = [];
    } else {
      this.getCharts(repoName)
    }
    this.selectedChart = null;
    this.selectedRepo = repoName;
  }

  /**
   * Selects a chart to deploy.
   * @export
   */
  selectChart(chartName) {
    for (var i = 0; i < this.charts.length; i++) { 
      this.charts[i]["selected"] = "";
      if (this.charts[i]["fullURL"] == chartName) {
        this.charts[i]["selected"] = this.selectedClass;  
      }
    }
    this.selectedChart = chartName;
  }
}

const i18n = {
  /** @export {string} @desc Label "Chart Repository" label, for the chart repository on the deploy
   *  from chart page. */
  MSG_CHART_REPOSITORY_LABEL: goog.getMsg('Chart Repository'),

  /** @export {string} @desc User help for chart repository selection on the deploy from chart page.
     */
  MSG_DEPLOY_CHART_REPO_USER_HELP: goog.getMsg(`Select a Chart Repository.`),

  /** @export {string} @desc User help for chart selection on the deploy from chart page. */
  MSG_DEPLOY_CHART_USER_HELP: goog.getMsg(`Select a Chart to deploy.`),

  /** @export {string} @desc Label "Chart URL" label, for the chart to deploy. */
  MSG_CHART_URL_LABEL: goog.getMsg('Chart URL'),

  /** @export {string} @desc User helm for chart URL to deploy
      */
  MSG_DEPLOY_CHART_URL_USER_HELP: goog.getMsg(`Specify the URL of the chart to deploy.`),

  /** @export {string} @desc Label "Release Name" label, for the release name on the deploy
   *  from chart page. */
  MSG_DEPLOY_CHART_RELEASE_NAME_LABEL: goog.getMsg('Release Name'),
  
  /** @export {string} @desc User help for chart release name on the deploy from chart page.
     */
  MSG_DEPLOY_CHART_RELEASE_NAME_USER_HELP: goog.getMsg(`Optionally, specify a release name.`),

  /** @export {string} @desc Label "Custom values YAML file", for the custom values file on the deploy
   *  from chart page. */
  MSG_DEPLOY_CHART_VALUES_YAML_FILE_LABEL: goog.getMsg('Custom Values YAML file'),

  /** @export {string} @desc User help for chart custom values on the deploy from chart page.
     */
  MSG_DEPLOY_CHART_CUSTOM_VALUES_USER_HELP: goog.getMsg(`Optionally, specify a custom values file.`),

  /** @export {string} @desc The text is put on the button at the end of the chart deploy
   * page. */
  MSG_DEPLOY_CHART_ACTION: goog.getMsg('Deploy'),

  /** @export {string} @desc The text is put on the 'Cancel' button at the end of the chart deploy
   * page. */
  MSG_DEPLOY_CHART_ACTION_CANCEL: goog.getMsg('Cancel'),

};
