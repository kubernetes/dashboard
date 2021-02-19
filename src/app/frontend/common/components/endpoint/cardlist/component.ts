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
import {Endpoint} from '@api/root.api';

@Component({
  selector: 'kd-endpoint-card-list',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class EndpointListComponent {
  @Input() initialized: boolean;
  @Input() endpoints: Endpoint[];

  getEndpointsColumns(): string[] {
    return ['Host', 'Ports (Name, Port, Protocol)', 'Node', 'Ready'];
  }

  getDataSource(): MatTableDataSource<Endpoint> {
    const tableData = new MatTableDataSource<Endpoint>();
    tableData.data = this.endpoints;

    return tableData;
  }

  trackByEndpoint(index: number, item: Endpoint): any {
    if (item.objectMeta) {
      if (item.objectMeta.uid) {
        return item.objectMeta.uid;
      }

      if (item.objectMeta.namespace) {
        return `${item.objectMeta.namespace}/${item.objectMeta.name}`;
      }

      return item.objectMeta.name;
    }

    return `${item.host}/${index}`;
  }
}
