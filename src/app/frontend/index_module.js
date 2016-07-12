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
import deploymentListModule from './deploymentlist/deploymentlist_module';
import errorModule from './error/error_module';
import indexConfig from './index_config';
import jobListModule from './joblist/joblist_module';
import jobDetailModule from './jobdetail/jobdetail_module';
import logsModule from './logs/logs_module';
import namespaceDetailModule from './namespacedetail/namespacedetail_module';
import namespaceListModule from './namespacelist/namespacelist_module';
import nodeListModule from './nodelist/nodelist_module';
import replicaSetListModule from './replicasetlist/replicasetlist_module';
import replicationControllerDetailModule from './replicationcontrollerdetail/replicationcontrollerdetail_module';
import replicationControllerListModule from './replicationcontrollerlist/replicationcontrollerlist_module';
import routeConfig from './index_route';
import serviceDetailModule from './servicedetail/servicedetail_module';
import serviceListModule from './servicelist/servicelist_module';
import workloadsModule from './workloads/workloads_module';
import podDetailModule from './poddetail/poddetail_module';
import petSetListModule from './petsetlist/petsetlist_module';

export default angular
    .module(
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
          jobListModule.name,
          jobDetailModule.name,
          logsModule.name,
          replicationControllerDetailModule.name,
          replicationControllerListModule.name,
          replicaSetListModule.name,
          namespaceDetailModule.name,
          namespaceListModule.name,
          nodeListModule.name,
          deploymentListModule.name,
          workloadsModule.name,
          serviceDetailModule.name,
          serviceListModule.name,
          podDetailModule.name,
          petSetListModule.name,
        ])
    .config(indexConfig)
    .config(routeConfig);
