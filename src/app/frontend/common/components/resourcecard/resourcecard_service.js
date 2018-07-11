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
 * Service designed for suspension of CronJobs
 * @final
 */
export class SuspendService {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$log} $log
   * @param {!angular.$resource} $resource
   * @ngInject
   */
  constructor($state, $log, $resource) {
    /** @private {!ui.router.$state}} */
    this.state_ = $state;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;
  }

  /**
   * @param {!backendApi.CronJob} cron
   */
  disable(cron) {
    return this.disablePromised(cron)
        .update(this.successDisable_.bind(this), this.error_.bind(this))
        .$promise;
  }

  /**
   * @param {!backendApi.CronJob} cron
   */
  enable(cron) {
    return this.enablePromised(cron)
        .update(this.successEnable_.bind(this), this.error_.bind(this))
        .$promise;
  }

  /**
   * @param {!backendApi.CronJob} cron
   */
  disablePromised(cron) {
    return this.resource_(
        `api/v1/suspend/${cron.objectMeta.namespace}/${cron.objectMeta.name}/`, {'suspend': 'true'},
        {
          update: {
            // redefine update action defaults
            method: 'PUT',
            transformRequest: function(headers) {
              headers = angular.extend({}, headers, {'Content-Type': 'application/json'});
              return angular.toJson(headers);
            },
          },
        });
  }

  /**
   * @param {!backendApi.CronJob} cron
   */
  enablePromised(cron) {
    return this.resource_(
        `api/v1/suspend/${cron.objectMeta.namespace}/${cron.objectMeta.name}/`,
        {'suspend': 'false'}, {
          update: {
            // redefine update action defaults
            method: 'PUT',
            transformRequest: function(headers) {
              headers = angular.extend({}, headers, {'Content-Type': 'application/json'});
              return angular.toJson(headers);
            },
          },
        });
  }

  successDisable_() {
    this.log_.info(`Successfully updated cronjob suspension to true`);
    this.state_.reload();
  }

  successEnable_() {
    this.log_.info(`Successfully updated cronjob suspension to false`);
    this.state_.reload();
  }

  /**
   * @param {!angular.$http.Response} err
   * @private
   */
  error_(err) {
    this.log_.error(err);
  }
}
