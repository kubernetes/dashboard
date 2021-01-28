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

import {Component, Input} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {VolumeMounts, PersistentVolumeSource} from '@api/backendapi';
import {KdStateService} from '../../services/global/state';
import {GlobalServicesModule} from '../../services/global/module';

@Component({
  selector: 'kd-volumemounts-list',
  templateUrl: './template.html',
})
export class VolumeMountComponent {
  @Input() initialized: boolean;
  @Input() volumeMounts: VolumeMounts[];
  @Input() namespace: string;

  private readonly kdState_: KdStateService = GlobalServicesModule.injector.get(KdStateService);

  getVolumeMountColumns(): string[] {
    return ['Name', 'Read Only', 'Mount Path', 'Sub Path', 'Source Type', 'Source Name'];
  }

  getDataSource(): MatTableDataSource<VolumeMounts> {
    const tableData = new MatTableDataSource<VolumeMounts>();
    tableData.data = this.volumeMounts;

    return tableData;
  }

  hasPanelInTheDashboard(sourceType: string): boolean {
    const implemented_panels = ['ConfigMap', 'Secret', 'PersistentVolumeClaim'];
    return implemented_panels.includes(sourceType);
  }

  getDetailsHref(name: string, kind: string): string {
    return this.kdState_.href(kind.toLowerCase(), name, this.namespace);
  }

  getTypeFromVolume(volume: PersistentVolumeSource): string {
    if (volume.hostPath) {
      return 'HostPath';
    }
    if (volume.emptyDir) {
      return 'EmptyDir';
    }
    if (volume.gcePersistentDisk) {
      return 'GcePersistentDisk';
    }
    if (volume.awsElasticBlockStore) {
      return 'AwsElasticBlockStore';
    }
    if (volume.gitRepo) {
      return 'GitRepo';
    }
    if (volume.secret) {
      return 'Secret';
    }
    if (volume.nfs) {
      return 'NFS';
    }
    if (volume.iscsi) {
      return 'iSCSI';
    }
    if (volume.glusterfs) {
      return 'GlusterFS';
    }
    if (volume.persistentVolumeClaim) {
      return 'PersistentVolumeClaim';
    }
    if (volume.rbd) {
      return 'RBD';
    }
    if (volume.flexVolume) {
      return 'FlexVolume';
    }
    if (volume.cinder) {
      return 'Cinder';
    }
    if (volume.cephFS) {
      return 'CephFS';
    }
    if (volume.flocker) {
      return 'Flocker';
    }
    if (volume.downwardAPI) {
      return 'DownwardAPI';
    }
    if (volume.fc) {
      return 'FC';
    }
    if (volume.azureFile) {
      return 'AzureFile';
    }
    if (volume.configMap) {
      return 'ConfigMap';
    }
    if (volume.vsphereVolume) {
      return 'vSphereVolume';
    }
    if (volume.quobyte) {
      return 'Quobyte';
    }
    if (volume.azureDisk) {
      return 'AzureDisk';
    }
    if (volume.photonPersistentDisk) {
      return 'PhotonPersistentDisk';
    }
    if (volume.projected) {
      return 'Projected';
    }
    if (volume.portworxVolume) {
      return 'PortworxVolume';
    }
    if (volume.scaleIO) {
      return 'ScaleIO';
    }
    if (volume.storageOS) {
      return 'StorageOS';
    }
    if (volume.csi) {
      return 'CSI';
    }
    return 'unknown';
  }

  getNameFromVolume(volume: PersistentVolumeSource): string {
    if (volume.hostPath) {
      return volume.hostPath.path;
    }
    if (volume.emptyDir) {
      return '-';
    }
    if (volume.gcePersistentDisk) {
      return volume.gcePersistentDisk.pdName;
    }
    if (volume.awsElasticBlockStore) {
      return volume.awsElasticBlockStore.volumeID;
    }
    if (volume.gitRepo) {
      return volume.gitRepo.repository + '/' + volume.gitRepo.directory + ':' + volume.gitRepo.revision;
    }
    if (volume.secret) {
      return volume.secret.secretName;
    }
    if (volume.nfs) {
      return volume.nfs.server + '/' + volume.nfs.path;
    }
    if (volume.iscsi) {
      return volume.iscsi.targetPortal + '/' + volume.iscsi.iqn + '/' + volume.iscsi.lun;
    }
    if (volume.glusterfs) {
      return volume.glusterfs.endpoints + '/' + volume.glusterfs.path;
    }
    if (volume.persistentVolumeClaim) {
      return volume.persistentVolumeClaim.claimName;
    }
    if (volume.rbd) {
      return volume.rbd.image;
    }
    if (volume.flexVolume) {
      return volume.flexVolume.driver;
    }
    if (volume.cinder) {
      return volume.cinder.volumeID;
    }
    if (volume.cephFS) {
      return volume.cephFS.path;
    }
    if (volume.flocker) {
      return volume.flocker.datasetName;
    }
    // if (volume.downwardAPI ) { return '-'; }
    // if (volume.fc ) { return '-'; }
    if (volume.azureFile) {
      return volume.azureFile.shareName;
    }
    if (volume.configMap) {
      return volume.configMap.name;
    }
    if (volume.vsphereVolume) {
      return volume.vsphereVolume.volumePath;
    }
    if (volume.quobyte) {
      return volume.quobyte.volume;
    }
    if (volume.azureDisk) {
      return volume.azureDisk.diskName;
    }
    if (volume.photonPersistentDisk) {
      return volume.photonPersistentDisk.fsType;
    }
    // if (volume.projected) {      return '-';    }
    if (volume.portworxVolume) {
      return volume.portworxVolume.volumeID;
    }
    if (volume.scaleIO) {
      return volume.scaleIO.volumeName;
    }
    if (volume.storageOS) {
      return volume.storageOS.volumeName;
    }
    if (volume.csi) {
      return volume.csi.driver;
    }
    return '-';
  }
}
