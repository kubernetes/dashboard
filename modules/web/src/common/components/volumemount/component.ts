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
import {VolumeMounts} from '@api/root.api';
import {SupportedResources} from '@api/root.shared';
import {PersistentVolumeSource} from '@api/volume.api';
import {KdStateService} from '../../services/global/state';

@Component({
  selector: 'kd-volumemounts-list',
  templateUrl: './template.html',
})
export class VolumeMountComponent {
  @Input() initialized: boolean;
  @Input() volumeMounts: VolumeMounts[];
  @Input() namespace: string;

  constructor(private readonly kdState_: KdStateService) {}

  get columns(): string[] {
    return ['Name', 'Read Only', 'Mount Path', 'Sub Path', 'Source Type', 'Source Name'];
  }

  get dataSource(): MatTableDataSource<VolumeMounts> {
    const tableData = new MatTableDataSource<VolumeMounts>();
    tableData.data = this.volumeMounts;

    return tableData;
  }

  isResourceSupported(sourceType: string): boolean {
    return SupportedResources.isSupported(sourceType);
  }

  getDetailsHref(name: string, kind: string): string {
    return this.kdState_.href(kind.toLowerCase(), name, this.namespace);
  }

  getMountTypeFromVolume(volume: PersistentVolumeSource): string {
    if (!volume) {
      return '-';
    }

    // This is to make sure that volume is an actual class instance with all methods.
    volume = new PersistentVolumeSource(volume);
    return volume.source ? volume.source.mountType : '-';
  }

  getNameFromVolume(volume: PersistentVolumeSource): string {
    if (!volume) {
      return '-';
    }

    // This is to make sure that volume is an actual class instance with all methods.
    volume = new PersistentVolumeSource(volume);
    return volume.source ? volume.source.displayName : '-';
  }
}
