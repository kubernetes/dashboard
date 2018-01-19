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

import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {UIView} from '@uirouter/angular';

import {AboutModule} from './about/module';
import {ChromeModule} from './chrome/module';
import {CoreModule} from './core.module';
import {LoginModule} from './login/module';
import {OverviewModule} from './overview/module';
import {ClusterModule} from './resource/cluster/module';
import {NamespaceModule} from './resource/cluster/namespace/module';
import {NodeModule} from './resource/cluster/node/module';
import {PersistentVolumeModule} from './resource/cluster/persistentvolume/module';
import {RoleModule} from './resource/cluster/role/module';
import {StorageClassModule} from './resource/cluster/storageclass/module';
import {ConfigMapModule} from './resource/config/configmap/module';
import {ConfigModule} from './resource/config/module';
import {PersistentVolumeClaimModule} from './resource/config/persistentvolumeclaim/module';
import {SecretModule} from './resource/config/secret/module';
import {IngressModule} from './resource/discovery/ingress/module';
import {DiscoveryModule} from './resource/discovery/module';
import {ServiceModule} from './resource/discovery/service/module';
import {CronJobModule} from './resource/workloads/cronjob/module';
import {DaemonSetModule} from './resource/workloads/daemonset/module';
import {DeploymentModule} from './resource/workloads/deployment/module';
import {JobModule} from './resource/workloads/job/module';
import {WorkloadsModule} from './resource/workloads/module';
import {PodModule} from './resource/workloads/pod/module';
import {ReplicaSetModule} from './resource/workloads/replicaset/module';
import {ReplicationControllerModule} from './resource/workloads/replicationcontroller/module';
import {StatefulSetModule} from './resource/workloads/statefulset/module';
import {SettingsModule} from './settings/module';

@NgModule({
  imports: [
    BrowserModule,
    // Application modules
    CoreModule,
    AboutModule,
    ChromeModule,
    ClusterModule,
    ConfigModule,
    ConfigMapModule,
    CronJobModule,
    DaemonSetModule,
    DeploymentModule,
    DiscoveryModule,
    IngressModule,
    JobModule,
    LoginModule,
    NamespaceModule,
    NodeModule,
    OverviewModule,
    PersistentVolumeModule,
    PersistentVolumeClaimModule,
    PodModule,
    ReplicaSetModule,
    ReplicationControllerModule,
    RoleModule,
    SecretModule,
    ServiceModule,
    SettingsModule,
    StatefulSetModule,
    StorageClassModule,
    WorkloadsModule,
  ],
  bootstrap: [UIView]
})
export class RootModule {}
