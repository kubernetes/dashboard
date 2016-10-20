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

import {AutoRefreshController} from './autorefresh_controller';
/**
 * Provides upload file mechanism and updates the model with file parameter for the selected file.
 * @param {!./poll_service.PollService} kdPoll
 * @return {!angular.Directive}
 * @ngInject
 */
export default function autoRefreshDirective(kdPoll) {
  return {
    scope: {},
    bindToController: {
      // Resource object to query data.
      'source': '=',
      // The the model object which is updated in each poll.
      'target': '=',
      // Type of the page like detail list, list-without-namespace, detail page and etc.
      'type': '@?',
      // Polling timeout in milliseconds.
      'delay': '@?',
    },
    controller: AutoRefreshController,
    controllerAs: 'ctrl',
    templateUrl: '',
    link: function(scope) {
      /**
       * @type {./poll_service.PollService}
       * @private
       */
      let kdPoll_ = kdPoll;

      // Cancel all polls in case of state change to avoid accumulated polls.
      scope.$on('$stateChangeStart', () => {
        kdPoll_.removeAll();
      });

      // Stop all polls when any menu is open to avoid disappearing them while auto-refresh.
      /** @type {function()} */
      let menuOpenEvent = scope.$root.$on('$mdMenuOpen', () => {
        kdPoll_.stopAll();
      });

      scope.$on('$destroy', menuOpenEvent);

      // Continue polling if any stopped after any menu is open.
      /** @type {function()} */
      let menuCloseEvent = scope.$root.$on('$mdMenuClose', () => {
        kdPoll_.startAll();
      });
      scope.$on('$destroy', menuCloseEvent);
    },
  };
}
