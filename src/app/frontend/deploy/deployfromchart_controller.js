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
    this.repos = ["None", "kubernetes-charts", "ammeon-charts", "aia-charts"];

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
        chartName: this.selectedChart,
        releaseName: this.name,
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
    /** @type {!angular.Resource<!backendApi.RepoList>} */
    let resource = this.resource_(`api/v1/repository`);
    resource.get(
        (res) => { this.repos = res.repos.map((e) => e.objectMeta.name); },
        (err) => { this.log_.log(`Error getting secrets: ${err}`); });
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
        (res) => { this.charts = res.charts.map((e) => e.objectMeta.name); },
        (err) => { this.log_.log(`Error getting secrets: ${err}`); });
  }

  /**
   * Selects a chart repository.
   * @export
   */
  selectRepo(repoName) {
    
    if (repoName == "ammeon-charts") {
      this.charts = [{"icon": "https://deis.com/assets/images/svg/helm-logo.svg",
                  "name": "Example App 1",
                  "version": "Example App 1",
                  "fullName": "aia-repo/aia-timezone-converter1-1.0.1.tgz",
                  "description": "Example App with sample app",
                  "selected": "",
                 },
                 {"icon": "https://wiki.postgresql.org/images/3/30/PostgreSQL_logo.3colors.120x120.png",
                  "name": "PostgresSQL",
                  "fullName": "aia-repo/aia-timezone-converter2-1.0.1.tgz",
                  "description": "An postgresql sample database app",
                 },
                 {"icon": "http://design.jboss.org/wildfly/logo/final/wildfly_logo_stacked_600px.png",
                  "name": "Wildfly App 1",
                  // "fullName": repoName + "/" + "aia-timezone-converter" + "-" + "1.0.1" + ".tgz",
                  "fullName": "aia-repo" + "/" + "aia-timezone-converter" + "-" + "1.0.1" + ".tgz",
                  "description": "Example App with Activemq",
                  "selected": "",
                 },
                 {"icon": "https://deis.com/assets/images/svg/helm-logo.svg",
                  "name": "Wildfly App 2",
                  "fullName": "aia-repo/aia-timezone-converter3-1.0.1.tgz",
                  "description": "Example App with Activemq",
                  "selected": "",
                 },
                 {"icon": "https://deis.com/assets/images/svg/helm-logo.svg",
                  "name": "Wildfly App 3",
                  "fullName": "aia-repo/aia-timezone-converter4-1.0.1.tgz",
                  "description": "Example App with Activemq",
                  "selected": "",
                 },
                ];
    }
    if (repoName == "kubernetes-charts") {
      this.charts = [
               {"icon": "https://wiki.postgresql.org/images/3/30/PostgreSQL_logo.3colors.120x120.png",
                "name": "PostgresSQL",
                "fullName": "aia-repo/aia-timezone-converter4-1.0.1.tgz",
                "description": "An postgresql sample database app",
                "selected": "",
               },
              ];
    }
    if (repoName == "aia-charts") {
      this.charts = [
               {"icon": "https://sematext.com/img/integrations-icons/zookeeper.png",
                "name": "aia-platform-zookeeper",
                "fullName": "aia-repo/aia-timezone-converter4-1.0.1.tgz",
                "description": "AIA platform - zookeeper distributed configuraiton service.",
                "selected": "",
               },
               {"icon": "http://kafka.apache.org/images/kafka_logo.png",
                "name": "aia-platform-kafka",
                "fullName": "aia-repo/aia-timezone-converter4-1.0.1.tgz",
                "description": "AIA platform - Kafka, Schema Registry, REST and Manager.",
                "selected": "",
               },
               {"icon": "http://remoters.net/wp-content/uploads/2016/05/timezone-logo-1.png",
                "name": "aia-event-generator",
                "fullName": "aia-repo/aia-timezone-converter4-1.0.1.tgz",
                "description": "AIA - example time event generator.",
                "selected": "",
               },
               {"icon": "https://lh5.ggpht.com/Dq-k1bhBmb13rmBtX_rmifu9xl60UDRYYHDA8JRXhVkd1Ga4vjOrq1xRBR6buYjyunXU=w300",
                "name": "aia-timezone-converter",
                "fullName": "aia-repo/aia-timezone-converter4-1.0.1.tgz",
                "description": "AIA - example timezone converter app.",
                "selected": "",
               },
              ];
    }
    if (repoName == "None") {
      this.charts = [];
    }
    this.selectedChart = null;
  }

  /**
   * Selects a chart to deploy.
   * @export
   */
  selectChart(chartName) {
    for (var i = 0; i < this.charts.length; i++) { 
      this.charts[i]["selected"] = "";
      if (this.charts[i]["fullName"] == chartName) {
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

  /** @export {string} @desc User help for chart selection on the deploy from chart page.
     */
  MSG_DEPLOY_CHART_USER_HELP: goog.getMsg(`Select a Chart to deploy.`),

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
