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
import {LimitRange} from 'typings/root.api';

@Component({
  selector: 'kd-resource-limit-list',
  templateUrl: './template.html',
})
export class ResourceLimitListComponent {
  @Input() initialized: boolean;
  @Input() limits: LimitRange[];

  getColumnIds(): string[] {
    return ['name', 'type', 'default', 'request'];
  }

  getDataSource(): MatTableDataSource<LimitRange> {
    const tableData = new MatTableDataSource<LimitRange>();
    tableData.data = this.limits;
    return tableData;
  }

  trackByLimitRage(_: number, item: LimitRange): any {
    return `${item.resourceType}/${item.resourceName}`;
  }
}
