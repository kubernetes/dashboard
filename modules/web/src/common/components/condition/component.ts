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

import {Component, Input, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {Condition} from 'typings/root.api';

@Component({
  selector: 'kd-condition-list',
  templateUrl: './template.html',
})
export class ConditionListComponent implements OnInit {
  @Input() initialized: boolean;
  @Input() conditions: Condition[];
  @Input() showLastProbeTime = true;
  private columns = {
    0: 'type',
    1: 'status',
    2: 'lastProbeTime',
    3: 'lastTransitionTime',
    4: 'reason',
    5: 'message',
  };

  ngOnInit(): void {
    if (!this.showLastProbeTime) {
      delete this.columns[2];
    }
  }

  getConditionsColumns(): {[key: number]: string} {
    return this.columns;
  }

  getColumnKeys(): string[] {
    return Object.values(this.columns);
  }

  getDataSource(): MatTableDataSource<Condition> {
    const tableData = new MatTableDataSource<Condition>();
    tableData.data = this.conditions;

    return tableData;
  }

  trackByConditionType(_: number, item: Condition): any {
    return item.type;
  }
}
