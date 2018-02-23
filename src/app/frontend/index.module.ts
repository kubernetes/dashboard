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

import {NgModule, NgModuleFactoryLoader, SystemJsNgModuleLoader} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {UIRouterModule} from '@uirouter/angular';

import {aboutFutureState} from './about/state';
import {ChromeModule} from './chrome/module';
import {chromeState} from './chrome/state';
import {CoreModule} from './core.module';
import {createFutureState} from './create/state';
import {ErrorModule} from './error/module';
import {RootComponent} from './index.component';
import {configureRouter} from './index.router.config';
import {LoginModule} from './login/module';
import {loginState} from './login/state';
import {overviewFutureState, overviewState} from './overview/state';
import {clusterRoleFutureState} from './resource/cluster/clusterrole/state';
import {namespaceFutureState} from './resource/cluster/namespace/state';
import {nodeFutureState} from './resource/cluster/node/state';
import {persistentVolumeFutureState} from './resource/cluster/persistentvolume/state';
import {clusterFutureState} from './resource/cluster/state';
import {storageClassFutureState} from './resource/cluster/storageclass/state';
import {configMapFutureState} from './resource/config/configmap/state';
import {persistentVolumeClaimFutureState} from './resource/config/persistentvolumeclaim/state';
import {secretFutureState} from './resource/config/secret/state';
import {configFutureState} from './resource/config/state';
import {ingressFutureState} from './resource/discovery/ingress/state';
import {serviceFutureState} from './resource/discovery/service/state';
import {discoveryFutureState} from './resource/discovery/state';
import {cronJobFutureState} from './resource/workloads/cronjob/state';
import {daemonSetFutureState} from './resource/workloads/daemonset/state';
import {deploymentFutureState} from './resource/workloads/deployment/state';
import {jobFutureState} from './resource/workloads/job/state';
import {podFutureState} from './resource/workloads/pod/state';
import {replicaSetFutureState} from './resource/workloads/replicaset/state';
import {replicationControllerFutureState} from './resource/workloads/replicationcontroller/state';
import {workloadsFutureState} from './resource/workloads/state';
import {statefulSetFutureState} from './resource/workloads/statefulset/state';
import {searchFutureState} from './search/state';
import {settingsFutureState} from './settings/state';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    ChromeModule,
    LoginModule,
    ErrorModule,
    UIRouterModule.forRoot({
      states: [
        // Core states
        chromeState,
        loginState,
        // Lazy-loaded states
        // Cluster section
        clusterFutureState,
        namespaceFutureState,
        nodeFutureState,
        persistentVolumeFutureState,
        clusterRoleFutureState,
        storageClassFutureState,
        // Workloads section
        workloadsFutureState,
        cronJobFutureState,
        daemonSetFutureState,
        deploymentFutureState,
        jobFutureState,
        podFutureState,
        replicaSetFutureState,
        replicationControllerFutureState,
        statefulSetFutureState,
        // Discovery section
        discoveryFutureState,
        ingressFutureState,
        serviceFutureState,
        // Config section
        configFutureState,
        configMapFutureState,
        persistentVolumeClaimFutureState,
        secretFutureState,
        // Others
        aboutFutureState,
        createFutureState,
        settingsFutureState,
        searchFutureState,
        overviewFutureState,
      ],
      useHash: true,
      otherwise: {state: overviewState.name},
      config: configureRouter,
    }),
  ],
  providers: [{provide: NgModuleFactoryLoader, useClass: SystemJsNgModuleLoader}],
  declarations: [RootComponent],
  bootstrap: [RootComponent]
})
export class RootModule {}
