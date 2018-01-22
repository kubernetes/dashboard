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

import {AfterContentInit, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {MatDrawer} from '@angular/material';

import {aboutState} from '../../about/state';
import {NavService} from '../../common/services/nav/service';
import {overviewState} from '../../overview/state';
import {namespaceState} from '../../resource/cluster/namespace/state';
import {nodeState} from '../../resource/cluster/node/state';
import {persistentVolumeState} from '../../resource/cluster/persistentvolume/state';
import {roleState} from '../../resource/cluster/role/state';
import {clusterState} from '../../resource/cluster/state';
import {storageClassState} from '../../resource/cluster/storageclass/state';
import {configMapState} from '../../resource/config/configmap/state';
import {persistentVolumeClaimState} from '../../resource/config/persistentvolumeclaim/state';
import {secretState} from '../../resource/config/secret/state';
import {configState} from '../../resource/config/state';
import {ingressState} from '../../resource/discovery/ingress/state';
import {serviceState} from '../../resource/discovery/service/state';
import {discoveryState} from '../../resource/discovery/state';
import {cronJobState} from '../../resource/workloads/cronjob/state';
import {daemonSetState} from '../../resource/workloads/daemonset/state';
import {deploymentState} from '../../resource/workloads/deployment/state';
import {jobState} from '../../resource/workloads/job/state';
import {podState} from '../../resource/workloads/pod/state';
import {replicaSetState} from '../../resource/workloads/replicaset/state';
import {replicationControllerState} from '../../resource/workloads/replicationcontroller/state';
import {workloadsState} from '../../resource/workloads/state';
import {statefulSetState} from '../../resource/workloads/statefulset/state';
import {settingsState} from '../../settings/state';

@Component({
  selector: 'kd-nav',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class NavComponent implements AfterContentInit, OnInit {
  @ViewChild(MatDrawer) private nav_: MatDrawer;
  states = {
    cluster: clusterState.name,
    namespace: namespaceState.name,
    node: nodeState.name,
    persistentVolume: persistentVolumeState.name,
    role: roleState.name,
    storageClass: storageClassState.name,
    overview: overviewState.name,
    workloads: workloadsState.name,
    cronJob: cronJobState.name,
    daemonSet: daemonSetState.name,
    deployment: deploymentState.name,
    job: jobState.name,
    pod: podState.name,
    replicaSet: replicaSetState.name,
    replicationController: replicationControllerState.name,
    statefulSet: statefulSetState.name,
    discovery: discoveryState.name,
    ingress: ingressState.name,
    service: serviceState.name,
    config: configState.name,
    configMap: configMapState.name,
    persistentVolumeClaim: persistentVolumeClaimState.name,
    secret: secretState.name,
    settings: settingsState.name,
    about: aboutState.name,
  };

  constructor(private navService_: NavService) {}

  ngOnInit() {
    this.navService_.setNav(this.nav_);
  }

  ngAfterContentInit() {
    this.nav_.open();
  }
}
