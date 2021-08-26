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

import {SupportedResources, StringMap} from '@api/root.shared';
import {isObject} from 'lodash';

export class PersistentVolumeSource {
  name: string;
  hostPath?: HostPathVolumeSource;
  emptyDir?: EmptyDirVolumeSource;
  gcePersistentDisk?: GCEPersistentDiskVolumeSource;
  awsElasticBlockStore?: AWSElasticBlockStorageVolumeSource;
  gitRepo?: GitRepoVolumeSource;
  secret?: SecretVolumeSource;
  nfs?: NFSVolumeSource;
  iscsi?: ISCSIVolumeSource;
  glusterfs?: GlusterfsVolumeSource;
  persistentVolumeClaim?: PersistentVolumeClaimVolumeSource;
  rbd?: RBDVolumeSource;
  flexVolume?: FlexVolumeSource;
  cinder?: CinderVolumeSource;
  cephfs?: CephFSVolumeSource;
  flocker?: FlockerVolumeSource;
  downwardAPI?: DownwardAPIVolumeSource;
  fc?: FCVolumeSource;
  azureFile?: AzureFileVolumeSource;
  configMap?: ConfigMapVolumeSource;
  vsphereVolume?: VSphereVirtualDiskVolumeSource;
  quobyte?: QuobyteVolumeSource;
  azureDisk: AzureDiskVolumeSource;
  photonPersistentDisk: PhotonPersistentDiskVolumeSource;
  projected: ProjectedVolumeSource;
  portworxVolume: PortworxVolumeSource;
  scaleIO: ScaleIOVolumeSource;
  storageOS: StorageOSVolumeSource;
  csi?: CSIVolumeSource;

  constructor(volume: PersistentVolumeSource) {
    Object.assign(this, volume);
  }

  get source(): IVolumeSource {
    const sourceKey = Object.keys(this)
      .filter(key => {
        const value = (this as any)[key];
        return isObject(value) && value;
      })
      .pop() as keyof PersistentVolumeSourceRaw;

    if (!sourceKey) {
      return undefined;
    }

    const volumeSource = VolumeSourceRegistry.get(sourceKey);
    return Object.assign(volumeSource, (this as any)[sourceKey]);
  }
}

// Our custom object to extend Persistent Volume Sources with generic type/name information
export class IVolumeSource {
  mountType: string;
  displayName: string;
}

export class HostPathVolumeSource implements IVolumeSource {
  path: string;
  type?: string;

  get mountType(): string {
    return 'HostPath';
  }

  get displayName(): string {
    return this.path;
  }
}

export class EmptyDirVolumeSource implements IVolumeSource {
  get mountType(): string {
    return 'EmptyDir';
  }

  get displayName(): string {
    return '-';
  }
}

export class GCEPersistentDiskVolumeSource implements IVolumeSource {
  pdName: string;
  fsType: string;
  partition: number;
  readOnly: boolean;

  get mountType(): string {
    return 'GCE Persistent Disk';
  }

  get displayName(): string {
    return this.pdName;
  }
}

export class AWSElasticBlockStorageVolumeSource implements IVolumeSource {
  volumeID: string;
  fsType: string;
  partition: number;
  readOnly: boolean;

  get mountType(): string {
    return 'AWS Elastic Block Store';
  }

  get displayName(): string {
    return this.volumeID;
  }
}

export class GitRepoVolumeSource implements IVolumeSource {
  repository: string;
  revision: string;
  directory: string;

  get mountType(): string {
    return 'GitRepo';
  }

  get displayName(): string {
    return `${this.repository}/${this.directory}:${this.revision}`;
  }
}

export class SecretVolumeSource implements IVolumeSource {
  secretName: string;
  defaultMode: number;
  optional: boolean;

  get mountType(): string {
    return SupportedResources.Secret;
  }

  get displayName(): string {
    return this.secretName;
  }
}

export class NFSVolumeSource implements IVolumeSource {
  server: string;
  path: string;
  readOnly: boolean;

  get mountType(): string {
    return 'NFS';
  }

  get displayName(): string {
    return `${this.server}:${this.path}`;
  }
}

export class ISCSIVolumeSource implements IVolumeSource {
  targetPortal: string;
  iqn: string;
  lun: number;
  fsType: string;
  readOnly: boolean;

  get mountType(): string {
    return 'ISCI';
  }

  get displayName(): string {
    return `${this.targetPortal}/${this.iqn}/${this.lun}`;
  }
}

export class GlusterfsVolumeSource implements IVolumeSource {
  endpoints: string;
  path: string;
  readOnly: boolean;

  get mountType(): string {
    return 'GlusterFS';
  }

  get displayName(): string {
    return `${this.endpoints}/${this.path}`;
  }
}

export class PersistentVolumeClaimVolumeSource implements IVolumeSource {
  claimName: string;
  readOnly: boolean;

  get mountType(): string {
    return SupportedResources.PersistentVolumeClaim;
  }

  get displayName(): string {
    return this.claimName;
  }
}

export class RBDVolumeSource implements IVolumeSource {
  monitors: string[];
  image: string;
  fsType: string;
  pool: string;
  user: string;
  keyring: string;
  secretRef: LocalObjectReference;
  readOnly: boolean;

  get mountType(): string {
    return 'RBD';
  }

  get displayName(): string {
    return this.image;
  }
}

export class FlexVolumeSource implements IVolumeSource {
  driver: string;
  fsType: string;
  readOnly: boolean;

  get mountType(): string {
    return 'Flex';
  }

  get displayName(): string {
    return this.driver;
  }
}

export class CinderVolumeSource implements IVolumeSource {
  volumeID: string;
  fsType: string;
  readOnly: boolean;

  get mountType(): string {
    return 'Cinder';
  }

  get displayName(): string {
    return this.volumeID;
  }
}

export class CephFSVolumeSource implements IVolumeSource {
  monitors: string[];
  path: string;
  user: string;
  secretFile: string;
  secretRef: LocalObjectReference;
  readonly: boolean;

  get mountType(): string {
    return 'CephFS';
  }

  get displayName(): string {
    return this.path;
  }
}

export class FlockerVolumeSource implements IVolumeSource {
  datasetName: string;

  get mountType(): string {
    return 'Flocker';
  }

  get displayName(): string {
    return this.datasetName;
  }
}

export class DownwardAPIVolumeSource implements IVolumeSource {
  defaultMode: number;

  get mountType(): string {
    return 'DownwardAPI';
  }

  get displayName(): string {
    return '-';
  }
}

export class FCVolumeSource implements IVolumeSource {
  targetWWNs: string[];
  lun: number;
  fsType: string;
  readOnly: boolean;

  get mountType(): string {
    return 'FC';
  }

  get displayName(): string {
    return '-';
  }
}

export class AzureFileVolumeSource implements IVolumeSource {
  secretName: string;
  shareName: string;
  readOnly: boolean;

  get mountType(): string {
    return 'Azure File';
  }

  get displayName(): string {
    return this.shareName;
  }
}

export class ConfigMapVolumeSource implements IVolumeSource {
  name: string;
  items: KeyToPath[];
  defaultMode: number;
  optional: boolean;

  get mountType(): string {
    return SupportedResources.ConfigMap;
  }

  get displayName(): string {
    return this.name;
  }
}

export class VSphereVirtualDiskVolumeSource implements IVolumeSource {
  volumePath: string;
  fsType: string;
  storagePolicyName: string;
  storagePolicyID: string;

  get mountType(): string {
    return 'VSphere Virtual Disk';
  }

  get displayName(): string {
    return this.volumePath;
  }
}

export class QuobyteVolumeSource implements IVolumeSource {
  registry: string;
  volume: string;
  readOnly: boolean;
  user: string;
  group: string;
  tenant: string;

  get mountType(): string {
    return 'Quobyte';
  }

  get displayName(): string {
    return this.volume;
  }
}

export class CSIVolumeSource implements IVolumeSource {
  driver: string;
  volumeHandle: string;
  readOnly?: boolean;
  fSType?: string;
  volumeAttributes?: StringMap;
  nodePublishSecretRef?: LocalObjectReference;

  get mountType(): string {
    return 'CSI';
  }

  get displayName(): string {
    return `${this.driver}/${this.volumeHandle}`;
  }
}

export class StorageOSVolumeSource implements IVolumeSource {
  volumeName: string;
  volumeNamespace?: string;
  fSType?: string;
  readOnly?: boolean;
  secretRef?: LocalObjectReference;

  get mountType(): string {
    return 'Storage OS';
  }

  get displayName(): string {
    return this.volumeName;
  }
}

export class ScaleIOVolumeSource implements IVolumeSource {
  gateway: string;
  system: string;
  secretRef: LocalObjectReference;
  sSLEnabled?: boolean;
  protectionDomain?: string;
  storagePool?: string;
  storageMode?: string;
  volumeName: string;
  fSType?: string;
  readOnly?: boolean;

  get mountType(): string {
    return 'Scale IO';
  }

  get displayName(): string {
    return this.volumeName;
  }
}

export class PortworxVolumeSource implements IVolumeSource {
  volumeID: string;
  fSType: string;
  readOnly?: boolean;

  get mountType(): string {
    return 'Portworx';
  }

  get displayName(): string {
    return this.volumeID;
  }
}

export class ProjectedVolumeSource implements IVolumeSource {
  sources?: VolumeProjection[];
  defaultMode?: number;

  get mountType(): string {
    return 'Projected';
  }

  get displayName(): string {
    return '-';
  }
}

export class PhotonPersistentDiskVolumeSource implements IVolumeSource {
  phID: string;
  fsType: string;

  get mountType(): string {
    return 'Photon Persistent Disk';
  }

  get displayName(): string {
    return this.fsType;
  }
}

export class AzureDiskVolumeSource implements IVolumeSource {
  diskName: string;
  dataDiskURI: string;
  cachingMode: AzureDataDiskCachingMode;
  fsType: string;
  readOnly: boolean;
  kind: AzureDataDiskKind;

  get mountType(): string {
    return 'Azure Disk';
  }

  get displayName(): string {
    return this.diskName;
  }
}

export interface VolumeProjection {
  secret?: SecretProjection;
  downwardAPI?: DownwardAPIProjection;
  configMap?: ConfigMapProjection;
  serviceAccountToken?: ServiceAccountTokenProjection;
}

export class ServiceAccountTokenProjection {
  audience: string;
  expirationSeconds: number;
  path: string;
}

export class ConfigMapProjection {
  items?: KeyToPath[];
  optional?: boolean;
}

export class SecretProjection {
  items?: KeyToPath[];
  optional?: boolean;
}

export class DownwardAPIProjection {
  items?: DownwardAPIVolumeFile[];
}

export class DownwardAPIVolumeFile {
  path: string;
  fieldRef?: ObjectFieldSelector;
  resourceFieldRef?: ResourceFieldSelector;
  mode?: number;
}

export class ResourceFieldSelector {
  containerName?: string;
  resource: string;
}

export class ObjectFieldSelector {
  aPIVersion?: string;
  fieldPath: string;
}

export class AzureDataDiskKind {
  azureDataDiskKind: string;
}

export class AzureDataDiskCachingMode {
  azureDataDiskCachingMode: string;
}

export class KeyToPath {
  key: string;
  path: string;
  mode: number;
}

export class LocalObjectReference {
  name: string;
}

type PersistentVolumeSourceRaw = Omit<PersistentVolumeSource, 'name'>;

// Helper logic to allow better handling of volume source data and more generic access
const VolumeSourceRegistry: Map<keyof PersistentVolumeSourceRaw, IVolumeSource> = new Map([
  ['hostPath', new HostPathVolumeSource()],
  ['emptyDir', new EmptyDirVolumeSource()],
  ['gcePersistentDisk', new GCEPersistentDiskVolumeSource()],
  ['awsElasticBlockStore', new AWSElasticBlockStorageVolumeSource()],
  ['gitRepo', new GitRepoVolumeSource()],
  ['secret', new SecretVolumeSource()],
  ['nfs', new NFSVolumeSource()],
  ['iscsi', new ISCSIVolumeSource()],
  ['glusterfs', new GlusterfsVolumeSource()],
  ['persistentVolumeClaim', new PersistentVolumeClaimVolumeSource()],
  ['rbd', new RBDVolumeSource()],
  ['flexVolume', new FlexVolumeSource()],
  ['cinder', new CinderVolumeSource()],
  ['cephfs', new CephFSVolumeSource()],
  ['flocker', new FlockerVolumeSource()],
  ['downwardAPI', new DownwardAPIVolumeSource()],
  ['fc', new FCVolumeSource()],
  ['azureFile', new AzureFileVolumeSource()],
  ['configMap', new ConfigMapVolumeSource()],
  ['vsphereVolume', new VSphereVirtualDiskVolumeSource()],
  ['quobyte', new QuobyteVolumeSource()],
  ['azureDisk', new AzureDiskVolumeSource()],
  ['photonPersistentDisk', new PhotonPersistentDiskVolumeSource()],
  ['projected', new ProjectedVolumeSource()],
  ['portworxVolume', new PortworxVolumeSource()],
  ['scaleIO', new ScaleIOVolumeSource()],
  ['storageOS', new StorageOSVolumeSource()],
  ['csi', new CSIVolumeSource()],
]);
