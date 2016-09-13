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

import {stateName as adminState} from 'admin/state';
import {stateName as configState} from 'config/state';
import {stateName as configMapState} from 'configmaplist/configmaplist_state';
import {stateName as daemonSetState} from 'daemonsetlist/daemonsetlist_state';
import {stateName as deploymentState} from 'deploymentlist/deploymentlist_state';
import {stateName as ingressState} from 'ingresslist/list_state';
import {stateName as jobState} from 'joblist/joblist_state';
import {stateName as namespaceState} from 'namespacelist/namespacelist_state';
import {stateName as nodeState} from 'nodelist/nodelist_state';
import {stateName as persistentVolumeClaimState} from 'persistentvolumeclaimlist/persistentvolumeclaimlist_state';
import {stateName as persistentVolumeState} from 'persistentvolumelist/persistentvolumelist_state';
import {stateName as petSetState} from 'petsetlist/petsetlist_state';
import {stateName as podState} from 'podlist/podlist_state';
import {stateName as replicaSetState} from 'replicasetlist/replicasetlist_state';
import {stateName as replicationControllerState} from 'replicationcontrollerlist/replicationcontrollerlist_state';
import {stateName as secretState} from 'secretlist/list_state';
import {stateName as serviceState} from 'servicelist/servicelist_state';
import {stateName as servicesanddiscoveryState} from 'servicesanddiscovery/state';
import {stateName as workloadState} from 'workloads/workloads_state';


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
      'admin': adminState,
      'pod': podState,
      'deployment': deploymentState,
      'replicaSet': replicaSetState,
      'replicationController': replicationControllerState,
      'daemonSet': daemonSetState,
      'persistentVolume': persistentVolumeState,
      'petSet': petSetState,
      'job': jobState,
      'service': serviceState,
      'persistentVolumeClaim': persistentVolumeClaimState,
      'secret': secretState,
      'configMap': configMapState,
      'ingress': ingressState,
      'serviceDiscovery': servicesanddiscoveryState,
      'config': configState,
    };

    /** @export */
    this.i18n = i18n;
  }

  /** @export */
  $onInit() { this.kdNavService_.registerNav(this); }

  /**
   * Toggles visibility of the navigation component.
   */
  toggle() { this.isVisible = !this.isVisible; }
}

/**
 * @type {!angular.Component}
 */
export const navComponent = {
  controller: NavController,
  templateUrl: 'chrome/nav/nav.html',
};

const i18n = {
  /** @export @desc Admin menu item in the nav. */
  MSG_NAV_MENU_ADMIN: goog.getMsg('Admin'),
  /** @export @desc Namespaces menu item in the nav. */
  MSG_NAV_MENU_NAMESPACES: goog.getMsg('Namespaces'),
  /** @export @desc Nodes menu item in the nav. */
  MSG_NAV_MENU_NODES: goog.getMsg('Nodes'),
  /** @export @desc Persistent Volumes menu item in the nav. */
  MSG_NAV_MENU_PERSISTENT_VOLUMES: goog.getMsg('Persistent Volumes'),
  /** @export @desc Workloads menu item in the nav. */
  MSG_NAV_MENU_WORKLOADS: goog.getMsg('Workloads'),
  /** @export @desc Deployments menu item in the nav. */
  MSG_NAV_MENU_DEPLOYMENTS: goog.getMsg('Deployments'),
  /** @export @desc Replica Sets menu item in the nav. */
  MSG_NAV_MENU_REPLICA_SETS: goog.getMsg('Replica Sets'),
  /** @export @desc Replication Controllers menu item in the nav. */
  MSG_NAV_MENU_REPLICATION_CONTROLLERS: goog.getMsg('Replication Controllers'),
  /** @export @desc Daemon Sets menu item in the nav. */
  MSG_NAV_MENU_DAEMON_SETS: goog.getMsg('Daemon Sets'),
  /** @export @desc Pet Sets menu item in the nav. */
  MSG_NAV_MENU_PET_SETS: goog.getMsg('Pet Sets'),
  /** @export @desc Jobs menu item in the nav. */
  MSG_NAV_MENU_JOBS: goog.getMsg('Jobs'),
  /** @export @desc Pods menu item in the nav. */
  MSG_NAV_MENU_PODS: goog.getMsg('Pods'),
  /** @export @desc Services and discovery menu item in the nav. */
  MSG_NAV_MENU_SERVICES_DISCOVERY: goog.getMsg('Services and discovery'),
  /** @export @desc Services menu item in the nav. */
  MSG_NAV_MENU_SERVICES: goog.getMsg('Services'),
  /** @export @desc Ingress item in the nav. */
  MSG_NAV_MENU_INGRESS: goog.getMsg('Ingress'),
  /** @export @desc Storage item in the nav. */
  MSG_NAV_MENU_STORAGE: goog.getMsg('Storage'),
  /** @export @desc Persistent Volume Claims item in the nav. */
  MSG_NAV_MENU_PVCS: goog.getMsg('Persistent Volume Claims'),
  /** @export @desc Config item in the nav. */
  MSG_NAV_MENU_CONFIG: goog.getMsg('Config'),
  /** @export @desc Secrets item in the nav. */
  MSG_NAV_MENU_SECRETS: goog.getMsg('Secrets'),
  /** @export @desc Config Maps item in the nav. */
  MSG_NAV_MENU_CONFIG_MAPS: goog.getMsg('Config Maps'),
};
