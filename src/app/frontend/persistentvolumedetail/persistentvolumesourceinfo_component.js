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
 * @final
 */
export default class PersistentVolumeSourceInfoController {
  /**
   * Constructs pettion controller info object.
   * @ngInject
   */
  constructor() {
    /**
     * Persistent volume source. Initialized from the scope.
     * @export {!backendApi.PersistentVolumeSource}
     */
    this.persistentVolumeSource;

    /** @export */
    this.i18n = i18n;
  }
}

export const persistentVolumeSourceInfoComponent = {
  controller: PersistentVolumeSourceInfoController,
  templateUrl: 'persistentvolumedetail/persistentvolumesourceinfo.html',
  bindings: {
    /** {!backendApi.PersistentVolumeSource} */
    'persistentVolumeSource': '=',
  },
};

const i18n = {
  /** @export {string} @desc Persistent volume source info title. */
  MSG_PVS_TITLE: goog.getMsg('Persistent volume source'),

  /** @export {string} @desc Persistent volume source info host path title. */
  MSG_PVS_HOST_PATH_TITLE: goog.getMsg('Host path'),
  /** @export {string} @desc Persistent volume source info host path section path entry. */
  MSG_PVS_HOST_PATH_PATH_ENTRY: goog.getMsg('Path'),

  /** @export {string} @desc Persistent volume source info GCE persistent disk title. */
  MSG_PVS_GCE_PERSISTENT_DISK_TITLE: goog.getMsg('GCE persistent disk'),
  /** @export {string} @desc Persistent volume source info GCE persistent disk section PD name entry. */
  MSG_PVS_GCE_PERSISTENT_DISK_PD_NAME_ENTRY: goog.getMsg('PD name'),
  /** @export {string} @desc Persistent volume source info GCE persistent disk section FS type entry. */
  MSG_PVS_GCE_PERSISTENT_DISK_FS_TYPE_ENTRY: goog.getMsg('FS type'),
  /** @export {string} @desc Persistent volume source info GCE persistent disk section partition entry. */
  MSG_PVS_GCE_PERSISTENT_DISK_PARTITION_ENTRY: goog.getMsg('Partition'),
  /** @export {string} @desc Persistent volume source info GCE persistent disk section read only entry. */
  MSG_PVS_GCE_PERSISTENT_DISK_READ_ONLY_ENTRY: goog.getMsg('Read only'),

  /** @export {string} @desc Persistent volume source info AWS block storage title. */
  MSG_PVS_AWS_ELASTIC_BLOCK_STORAGE_TITLE: goog.getMsg('AWS block storage'),
  /** @export {string} @desc Persistent volume source info AWS block storage section volume ID entry. */
  MSG_PVS_AWS_ELASTIC_BLOCK_STORAGE_VOLUME_ID_ENTRY: goog.getMsg('Volume ID'),
  /** @export {string} @desc Persistent volume source info AWS block storage section FS type entry. */
  MSG_PVS_AWS_ELASTIC_BLOCK_STORAGE_FS_TYPE_ENTRY: goog.getMsg('FS type'),
  /** @export {string} @desc Persistent volume source info AWS block storage section partition entry. */
  MSG_PVS_AWS_ELASTIC_BLOCK_STORAGE_PARTITION_ENTRY: goog.getMsg('Partition'),
  /** @export {string} @desc Persistent volume source info AWS block storage section read only entry. */
  MSG_PVS_AWS_ELASTIC_BLOCK_STORAGE_READ_ONLY_ENTRY: goog.getMsg('Read only'),

  /** @export {string} @desc Persistent volume source info GlusterFS title. */
  MSG_PVS_GLUSTER_FS_TITLE: goog.getMsg('GlusterFS'),
  /** @export {string} @desc Persistent volume source info GlusterFS section endpoints entry. */
  MSG_PVS_GLUSTER_FS_ENDPOINTS_ENTRY: goog.getMsg('Endpoints'),
  /** @export {string} @desc Persistent volume source info GlusterFS section path entry. */
  MSG_PVS_GLUSTER_FS_PATH_ENTRY: goog.getMsg('Path'),
  /** @export {string} @desc Persistent volume source info GlusterFS section read only entry. */
  MSG_PVS_GLUSTER_FS_READ_ONLY_ENTRY: goog.getMsg('Read only'),

  /** @export {string} @desc Persistent volume source info NFS title. */
  MSG_PVS_NFS_TITLE: goog.getMsg('NFS'),
  /** @export {string} @desc Persistent volume source info NFS section server entry. */
  MSG_PVS_NFS_SERVER_ENTRY: goog.getMsg('Server'),
  /** @export {string} @desc Persistent volume source info NFS section path entry. */
  MSG_PVS_NFS_PATH_ENTRY: goog.getMsg('Path'),
  /** @export {string} @desc Persistent volume source info NFS section read only entry. */
  MSG_PVS_NFS_READ_ONLY_ENTRY: goog.getMsg('Read only'),

  /** @export {string} @desc Persistent volume source info RBD title. */
  MSG_PVS_RBD_TITLE: goog.getMsg('RBD'),
  /** @export {string} @desc Persistent volume source info RBD section monitors entry. */
  MSG_PVS_RBD_MONITORS_ENTRY: goog.getMsg('Monitors'),
  /** @export {string} @desc Persistent volume source info RBD section image entry. */
  MSG_PVS_RBD_IMAGE_ENTRY: goog.getMsg('Image'),
  /** @export {string} @desc Persistent volume source info RBD section user entry. */
  MSG_PVS_RBD_USER_ENTRY: goog.getMsg('User'),
  /** @export {string} @desc Persistent volume source info RBD section keyring entry. */
  MSG_PVS_RBD_KEYRING_ENTRY: goog.getMsg('Keyring'),
  /** @export {string} @desc Persistent volume source info RBD section secretRef entry. */
  MSG_PVS_RBD_SECRETREF_ENTRY: goog.getMsg('SecretRef'),
  /** @export {string} @desc Persistent volume source info RBD section read only entry. */
  MSG_PVS_RBD_READ_ONLY_ENTRY: goog.getMsg('Read only'),

  /** @export {string} @desc Persistent volume source info ISCSI title. */
  MSG_PVS_ISCSI_TITLE: goog.getMsg('ISCSI'),
  /** @export {string} @desc Persistent volume source info ISCSI section target portal entry. */
  MSG_PVS_ISCSI_TARGET_PORTAL_ENTRY: goog.getMsg('Target portal'),
  /** @export {string} @desc Persistent volume source info ISCSI section IQN entry. */
  MSG_PVS_ISCSI_IQN_ENTRY: goog.getMsg('IQN'),
  /** @export {string} @desc Persistent volume source info ISCSI section lun entry. */
  MSG_PVS_ISCSI_LUN_ENTRY: goog.getMsg('Lun'),
  /** @export {string} @desc Persistent volume source info ISCSI section FS type entry. */
  MSG_PVS_ISCSI_FS_TYPE_ENTRY: goog.getMsg('FS type'),
  /** @export {string} @desc Persistent volume source info ISCSI section read only entry. */
  MSG_PVS_ISCSI_READ_ONLY_ENTRY: goog.getMsg('Read only'),

  /** @export {string} @desc Persistent volume source info cinder title. */
  MSG_PVS_CINDER_TITLE: goog.getMsg('Cinder'),
  /** @export {string} @desc Persistent volume source info cinder section volume ID entry. */
  MSG_PVS_CINDER_VOLUME_ID_ENTRY: goog.getMsg('Volume ID'),
  /** @export {string} @desc Persistent volume source info cinder section FS Type entry. */
  MSG_PVS_CINDER_FS_TYPE_ENTRY: goog.getMsg('FS Type'),
  /** @export {string} @desc Persistent volume source info cinder section read only entry. */
  MSG_PVS_CINDER_READ_ONLY_ENTRY: goog.getMsg('Read only'),

  /** @export {string} @desc Persistent volume source info FC title. */
  MSG_PVS_FC_TITLE: goog.getMsg('FC'),
  /** @export {string} @desc Persistent volume source info FC section target WWNs entry. */
  MSG_PVS_FC_TARGET_WWNS_ENTRY: goog.getMsg('Target WWNs'),
  /** @export {string} @desc Persistent volume source info FC section target FS type entry. */
  MSG_PVS_FC_FS_TYPE_ENTRY: goog.getMsg('FS type'),
  /** @export {string} @desc Persistent volume source info FC section lun entry. */
  MSG_PVS_FC_LUN_ENTRY: goog.getMsg('Lun'),
  /** @export {string} @desc Persistent volume source info FC section read only entry. */
  MSG_PVS_FC_READ_ONLY_ENTRY: goog.getMsg('Read only'),

  /** @export {string} @desc Persistent volume source info flocker title. */
  MSG_PVS_FLOCKER_TITLE: goog.getMsg('Flocker'),
  /** @export {string} @desc Persistent volume source info FC section dataset name entry. */
  MSG_PVS_FLOCKER_DATASET_NAME_ENTRY: goog.getMsg('Dataset name'),
};
