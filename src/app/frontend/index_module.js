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
 * @fileoverview Entry point module to the application. Loads and configures other modules needed
 * to bootstrap the application.
 */
import chromeModule from './chrome/chrome_module';
import deployModule from './deploy/deploy_module';
import errorModule from './error/error_module';
import i18n from './i18n/i18n_service';
import indexConfig from './index_config';
import routeConfig from './index_route';
import logsModule from './logs/logs_module';
import replicaSetDetailModule from './replicasetdetail/replicasetdetail_module';
import replicaSetListModule from './replicasetlist/replicasetlist_module';

export default angular.module(
                          'kubernetesDashboard',
                          [
                            'ngAnimate',
                            'ngAria',
                            'ngMaterial',
                            'ngMessages',
                            'ngResource',
                            'ngSanitize',
                            'ui.router',
                            chromeModule.name,
                            deployModule.name,
                            errorModule.name,
                            logsModule.name,
                            replicaSetDetailModule.name,
                            replicaSetListModule.name,
                          ])
    .config(indexConfig)
    .config(routeConfig)
    .factory('i18n', i18n);
