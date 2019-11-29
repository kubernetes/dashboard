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
import {MatTableDataSource} from '@angular/material';
import {Subject} from 'typings/backendapi';

@Component({
  selector: 'kd-subject-list',
  templateUrl: './template.html',
})
export class SubjectListComponent implements OnInit {
  @Input() initialized: boolean;
  @Input() subjects: Subject[];
  private columns = {
    0: 'kind',
    1: 'apiGroup',
    2: 'name',
    3: 'namespace',
  };

  ngOnInit(): void {}

  getSubjectsColumns(): {[key: number]: string} {
    return this.columns;
  }

  getColumnKeys(): string[] {
    return Object.values(this.columns);
  }

  getDataSource(): MatTableDataSource<Subject> {
    const tableData = new MatTableDataSource<Subject>();
    tableData.data = this.subjects;

    return tableData;
  }
}
