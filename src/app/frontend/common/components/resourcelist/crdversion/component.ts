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
import {CRDVersion} from '@api/root.api';

@Component({
  selector: 'kd-crd-versions-list',
  templateUrl: './template.html',
})
export class CRDVersionListComponent {
  @Input() versions: CRDVersion[];
  @Input() initialized: boolean;

  getDisplayColumns(): string[] {
    return ['name', 'served', 'storage'];
  }

  getDataSource(): MatTableDataSource<CRDVersion> {
    const tableData = new MatTableDataSource<CRDVersion>();
    tableData.data = this.versions;

    return tableData;
  }

  trackByCRDVersionName(_: number, item: CRDVersion): any {
    return item.name;
  }
}
