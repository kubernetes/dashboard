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

import settingsServiceModule from '../common/settings/module';

import {logsComponent} from './component';
import {DownloadService} from './download/service';
import {LogsService} from './service';
import stateConfig from './stateconfig';

/**
 * Angular module for the logs view.
 *
 */
export default angular
    .module(
        'kubernetesDashboard.logs',
        [
          'ngResource',
          'ngFileSaver',
          'ngMaterial',
          'ui.router',
          settingsServiceModule.name,
        ])
    .service('logsService', LogsService)
    .service('kdDownloadService', DownloadService)
    .component('kdLogs', logsComponent)
    .config(stateConfig)
    .decorator('$xhrFactory', httpProgressUpdateDecorator);

/**
 * Decorator used to expose `onProgress` function in order to be able to track download progress of
 * files. Usage: $http.get(url, {
 *    ...
 *    onProgress: (event) => {...}
 *  });
 *
 * @param {!function(*, string)} $delegate
 * @param {!angular.$injector} $injector
 * @return {!function(*, string)}
 * @export
 * @ngInject
 */
function httpProgressUpdateDecorator($delegate, $injector) {
  return (method, url) => {
    let xhr = $delegate(method, url);
    let http = $injector.get('$http');
    let callConfig = http.pendingRequests[http.pendingRequests.length - 1];

    if (angular.isFunction(callConfig.onProgress)) {
      xhr.addEventListener('progress', callConfig.onProgress);
    }

    return xhr;
  };
}
