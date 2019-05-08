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

import { AfterContentInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material';

import { aboutState } from '../../about/state';
import { NavService } from '../../common/services/nav/service';
import { overviewState } from '../../overview/state';
import { clusterRoleListState } from '../../resource/cluster/clusterrole/list/state';
import { namespaceListState } from '../../resource/cluster/namespace/list/state';
import { nodeListState } from '../../resource/cluster/node/list/state';
import { persistentVolumeListState } from '../../resource/cluster/persistentvolume/list/state';
import { clusterState } from '../../resource/cluster/state';
import { storageClassListState } from '../../resource/cluster/storageclass/list/state';
import { configMapListState } from '../../resource/config/configmap/list/state';
import { persistentVolumeClaimListState } from '../../resource/config/persistentvolumeclaim/list/state';
import { secretListState } from '../../resource/config/secret/list/state';
import { configState } from '../../resource/config/state';
import { ingressListState } from '../../resource/discovery/ingress/list/state';
import { serviceListState } from '../../resource/discovery/service/list/state';
import { discoveryState } from '../../resource/discovery/state';
import { cronJobListState } from '../../resource/workloads/cronjob/list/state';
import { daemonSetListState } from '../../resource/workloads/daemonset/list/state';
import { deploymentListState } from '../../resource/workloads/deployment/list/state';
import { jobListState } from '../../resource/workloads/job/list/state';
import { podListState } from '../../resource/workloads/pod/list/state';
import { replicaSetListState } from '../../resource/workloads/replicaset/list/state';
import { replicationControllerListState } from '../../resource/workloads/replicationcontroller/list/state';
import { workloadsState } from '../../resource/workloads/state';
import { statefulSetListState } from '../../resource/workloads/statefulset/list/state';
import { settingsState } from '../../settings/state';

@Component({
  selector: 'kd-nav',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class NavComponent implements AfterContentInit, OnInit {
  @ViewChild(MatDrawer) private readonly nav_: MatDrawer;
  states = {
    cluster: clusterState.name,
    namespace: namespaceListState.name,
    node: nodeListState.name,
    persistentVolume: persistentVolumeListState.name,
    clusterRole: clusterRoleListState.name,
    storageClass: storageClassListState.name,

    overview: overviewState.name,

    workloads: workloadsState.name,
    cronJob: cronJobListState.name,
    daemonSet: daemonSetListState.name,
    deployment: deploymentListState.name,
    job: jobListState.name,
    pod: podListState.name,
    replicaSet: replicaSetListState.name,
    replicationController: replicationControllerListState.name,
    statefulSet: statefulSetListState.name,

    discovery: discoveryState.name,
    ingress: ingressListState.name,
    service: serviceListState.name,

    config: configState.name,
    configMap: configMapListState.name,
    persistentVolumeClaim: persistentVolumeClaimListState.name,
    secret: secretListState.name,

    settings: settingsState.name,
    about: aboutState.name,
  };

  constructor(private readonly navService_: NavService) {}

  ngOnInit(): void {
    this.navService_.setNav(this.nav_);
  }

  ngAfterContentInit(): void {
    this.nav_.open();
  }
}
