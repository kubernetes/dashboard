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
 * @fileoverview Entry point module to the application. Loads and configures other modules needed
 * to bootstrap the application.
 */
import aboutModule from './about/module';
import chromeModule from './chrome/module';
import clusterModule from './cluster/module';
import authModule from './common/auth/module';
import csrfTokenModule from './common/csrftoken/module';
import scalingModule from './common/scaling/module';
import settingsServiceModule from './common/settings/module';
import configModule from './config/module';
import configMapModule from './configmap/module';
import cronJobModule from './cronjob/module';
import daemonSetModule from './daemonset/module';
import deployModule from './deploy/module';
import deploymentModule from './deployment/module';
import discoveryModule from './discovery/module';
import errorModule from './error/module';
import horizontalPodAutoscalerModule from './horizontalpodautoscaler/module';
import indexConfig from './index_config';
import {Controller} from './index_controller';
import routeConfig from './index_route';
import ingressModule from './ingress/module';
import jobModule from './job/module';
import loginModule from './login/module';
import logsModule from './logs/module';
import namespaceModule from './namespace/module';
import nodeModule from './node/module';
import overviewModule from './overview/module';
import persistentVolumeModule from './persistentvolume/module';
import persistentVolumeClaimModule from './persistentvolumeclaim/module';
import podModule from './pod/module';
import replicaSetModule from './replicaset/module';
import replicationControllerModule from './replicationcontroller/module';
import resourceLimitModule from './resourcelimit/module';
import resourceQuotaModule from './resourcequota/module';
import roleModule from './role/module';
import searchModule from './search/module';
import secretModule from './secret/module';
import serviceModule from './service/module';
import settingsModule from './settings/module';
import shellModule from './shell/module';
import statefulSetModule from './statefulset/module';
import storageClassModule from './storageclass/module';
import {TitleController} from './title_controller';
import workloadsModule from './workloads/module';

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
          aboutModule.name,
          settingsModule.name,
          settingsServiceModule.name,
          authModule.name,
          overviewModule.name,
          chromeModule.name,
          daemonSetModule.name,
          deployModule.name,
          errorModule.name,
          jobModule.name,
          cronJobModule.name,
          loginModule.name,
          logsModule.name,
          shellModule.name,
          replicationControllerModule.name,
          replicaSetModule.name,
          namespaceModule.name,
          nodeModule.name,
          deploymentModule.name,
          horizontalPodAutoscalerModule.name,
          workloadsModule.name,
          searchModule.name,
          clusterModule.name,
          serviceModule.name,
          podModule.name,
          persistentVolumeModule.name,
          statefulSetModule.name,
          persistentVolumeClaimModule.name,
          resourceQuotaModule.name,
          resourceLimitModule.name,
          configMapModule.name,
          secretModule.name,
          ingressModule.name,
          discoveryModule.name,
          configModule.name,
          csrfTokenModule.name,
          storageClassModule.name,
          roleModule.name,
          scalingModule.name,
        ])
    .config(indexConfig)
    .config(routeConfig)
    .controller('kdTitle', TitleController)
    .controller('kdMain', Controller);
