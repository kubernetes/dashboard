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
 * Controller for the resource card delete menu item component. It deletes card's resource.
 * @final
 */
export class ResourceCardSuspendMenuItemController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$log} $log
   * @param {!angular.$resource} $resource
   * @param {!./resourcecard_service.SuspendService} kdSuspendService
   * @ngInject
   */
  constructor($state, $log, $resource, kdSuspendService) {
    /**
     * Initialized from require just before $onInit is called.
     * @export {!./resourcecard_component.ResourceCardController}
     */
    this.resourceCardCtrl;

    /** @export {!backendApi.CronJob} */
    this.cron;

    /** @private {!./resourcecard_service.SuspendService} */
    this.suspendService_ = kdSuspendService;
  }

  /**
   * @export
   */
  disable() {
    return this.suspendService_.disable(this.cron);
  }

  enable() {
    return this.suspendService_.enable(this.cron);
  }
}

/**
 * @type {!angular.Component}
 */
export const resourceCardSuspendMenuItemComponent = {
  templateUrl: 'common/components/resourcecard/resourcecardsuspendmenuitem.html',
  bindings: {'resource': '<', 'cron': '<'},
  bindToController: true,
  require: {
    'resourceCardCtrl': '^kdResourceCard',
  },
  controller: ResourceCardSuspendMenuItemController,
};
