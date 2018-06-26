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
 * Controller for the resource card trigger menu item component. It manually triggers a cron job.
 * @final
 */
export class ResourceCardTriggerMenuItemController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$log} $log
   * @param {!angular.$resource} $resource
   * @ngInject
   */
  constructor($state, $log, $resource) {
    /**
     * Initialized from require just before $onInit is called.
     * @export {!./resourcecard_component.ResourceCardController}
     */
    this.resourceCardCtrl;

    /** @private {!ui.router.$state}} */
    this.state_ = $state;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @export {!backendApi.CronJob} */
    this.cron;
  }

  /**
   * @export
   */
  trigger() {
    return this.getResource()
        .update(this.onTriggerSuccess_.bind(this), this.onTriggerError_.bind(this))
        .$promise;
  }

  getResource() {
    return this.resource_(
        `api/v1/cronjob/${this.cron.objectMeta.namespace}/${this.cron.objectMeta.name}/trigger`, {},
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

  onTriggerSuccess_() {
    this.log_.info(`Successfully triggered cronjob "${this.cron.objectMeta.name}"`);
    this.state_.reload();
  }

  /**
   * @param {!angular.$http.Response} err
   * @private
   */
  onTriggerError_(err) {
    this.log_.error(err);
  }
}

/**
 * @type {!angular.Component}
 */
export const resourceCardTriggerMenuItemComponent = {
  templateUrl: 'common/components/resourcecard/resourcecardtriggermenuitem.html',
  bindings: {'resource': '<', 'cron': '<'},
  bindToController: true,
  require: {
    'resourceCardCtrl': '^kdResourceCard',
  },
  controller: ResourceCardTriggerMenuItemController,
};
