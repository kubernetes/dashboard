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

import {HttpClient} from '@angular/common/http';
import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ReplicaSetList, ReplicaSet, SetImageData} from '@api/root.api';
import {ResourceMeta} from '../../services/global/actionbar';
import {MatTableDataSource} from '@angular/material/table';

interface LastDeploymentData {
  timestamp: string;
  container_image: string;
}

@Component({
  selector: 'kd-setimage-dialog',
  templateUrl: 'template.html',
})
export class SetImageDialogComponent implements OnInit {
  result: SetImageData = {name: '', image: ''};
  no_result: SetImageData = null;
  containerNameList: string[] = [];
  replicaSetData: {[key: string]: {[key: string]: string}} = {};
  isInitialized = false;

  constructor(
    public dialogRef: MatDialogRef<SetImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ResourceMeta,
    private readonly http_: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadReplicaSets();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  // we can only deploy to containers that exist in the current deployment,
  // we have to get the latest replica set and check the container names in it
  // we should ignore container names that exist in older replica sets
  getContainerImageNamesFromLatestReplicaSet(replicaSets: ReplicaSet[]): [string, string[]] {
    const timestamps: {[key: string]: ReplicaSet} = {};

    for (const rs of replicaSets) {
      if (rs.objectMeta.creationTimestamp !== null) {
        timestamps[rs.objectMeta.creationTimestamp] = rs;
      }
    }
    const timestameList = Object.keys(timestamps).sort();
    if (timestameList.length === 0) {
      return [null, []];
    }

    const latestTimestamp = timestameList[timestameList.length - 1];
    const latestReplicaSet = timestamps[latestTimestamp];

    return [latestTimestamp, Object.keys(latestReplicaSet.containerImagesMap)];
  }

  setContainerImage(containerImage: string): boolean {
    this.result.image = containerImage;
    return false;
  }

  loadReplicaSets(): void {
    const url =
      `api/v1/${this.data.typeMeta.kind}` +
      (this.data.objectMeta.namespace ? `/${this.data.objectMeta.namespace}` : '') +
      `/${this.data.objectMeta.name}/allreplicasets`;

    this.http_
      .get<ReplicaSetList>(url)
      .toPromise()
      .then(rc => {
        const [latestTimestamp, containerNameList] = this.getContainerImageNamesFromLatestReplicaSet(rc.replicaSets);
        this.containerNameList = containerNameList;

        const replicaSetData: {[key: string]: {[key: string]: string}} = {};

        for (const rs of rc.replicaSets) {
          if (rs.objectMeta.creationTimestamp !== null) {
            for (const [container_name, container_image] of Object.entries(rs.containerImagesMap)) {
              if (!(container_name in replicaSetData)) {
                replicaSetData[container_name] = {};
              }

              replicaSetData[container_name][rs.objectMeta.creationTimestamp] = container_image;
            }
          }
        }

        this.replicaSetData = replicaSetData;

        if (this.containerNameList.length > 0) {
          this.result.name = this.containerNameList[0];
          this.result.image = this.replicaSetData[this.result.name][latestTimestamp];
        }

        this.isInitialized = true;
      });
  }

  getLastDeploymentsColumns(): string[] {
    return ['timestamp', 'container_image'];
  }

  getLastDeploymentsDataSource(): MatTableDataSource<LastDeploymentData> {
    const tableData = new MatTableDataSource<LastDeploymentData>();

    if (!this.isInitialized) {
      return tableData;
    }

    tableData.data = [];
    const dataSource = this.replicaSetData[this.result.name];
    const timestamps = Object.keys(dataSource).sort().reverse();
    for (const timestamp of timestamps) {
      const elem: LastDeploymentData = {
        timestamp: timestamp,
        container_image: dataSource[timestamp],
      };
      tableData.data.push(elem);
    }

    return tableData;
  }

  trackLastDeploymentsTimestamp(_: number, item: LastDeploymentData): string {
    return item.timestamp;
  }
}
