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

import {stateName as aboutState} from 'about/state';
import {stateName as clusterState} from 'cluster/state';
import {stateName as configState} from 'config/state';
import {stateName as configMapState} from 'configmap/list/state';
import {stateName as daemonSetState} from 'daemonset/list/state';
import {stateName as deploymentState} from 'deployment/list/state';
import {stateName as discoveryState} from 'discovery/state';
import {stateName as ingressState} from 'ingress/list/state';
import {stateName as jobState} from 'job/list/state';
import {stateName as namespaceState} from 'namespace/list/state';
import {stateName as nodeState} from 'node/list/state';
import {stateName as persistentVolumeState} from 'persistentvolume/list/state';
import {stateName as persistentVolumeClaimState} from 'persistentvolumeclaim/list/state';
import {stateName as podState} from 'pod/list/state';
import {stateName as replicaSetState} from 'replicaset/list/state';
import {stateName as replicationControllerState} from 'replicationcontroller/list/state';
import {stateName as roleState} from 'role/list/state';
import {stateName as secretState} from 'secret/list/state';
import {stateName as serviceState} from 'service/list/state';
import {stateName as statefulSetState} from 'statefulset/list/state';
import {stateName as storageClassState} from 'storageclass/list/state';
import {stateName as workloadState} from 'workloads/state';

/**
 * @final
 */
export class NavController {
  /**
   * @param {!./nav_service.NavService} kdNavService
   * @ngInject
   */
  constructor(kdNavService) {
    /** @export {boolean} */
    this.isVisible = true;

    /** @private {!./nav_service.NavService} */
    this.kdNavService_ = kdNavService;

    /** @export {!Object<string, string>} */
    this.states = {
      'namespace': namespaceState,
      'node': nodeState,
      'workload': workloadState,
      'cluster': clusterState,
      'pod': podState,
      'deployment': deploymentState,
      'replicaSet': replicaSetState,
      'replicationController': replicationControllerState,
      'daemonSet': daemonSetState,
      'persistentVolume': persistentVolumeState,
      'statefulSet': statefulSetState,
      'job': jobState,
      'service': serviceState,
      'persistentVolumeClaim': persistentVolumeClaimState,
      'secret': secretState,
      'configMap': configMapState,
      'ingress': ingressState,
      'discovery': discoveryState,
      'config': configState,
      'storageClass': storageClassState,
      'role': roleState,
      'about': aboutState,
    };
  }

  /** @export */
  $onInit() {
    this.kdNavService_.registerNav(this);
  }

  /**
   * Toggles visibility of the navigation component.
   */
  toggle() {
    this.isVisible = !this.isVisible;
  }

  /**
   * Sets visibility of the navigation component.
   */
  setVisibility(isVisible) {
    this.isVisible = isVisible;
  }
}

/**
 * @type {!angular.Component}
 */
export const navComponent = {
  controller: NavController,
  templateUrl: 'chrome/nav/nav.html',
};
