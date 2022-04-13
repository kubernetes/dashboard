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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {ActivatedRoute} from '@angular/router';
import {CapacityItem, PersistentVolumeDetail} from '@api/root.api';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {ActionbarService, ResourceMeta} from '@common/services/global/actionbar';
import {NotificationsService} from '@common/services/global/notifications';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {ResourceService} from '@common/services/resource/resource';
import {KdStateService} from '@common/services/global/state';
import {GlobalServicesModule} from '@common/services/global/module';

@Component({
  selector: 'kd-persistent-volume-detail',
  templateUrl: './template.html',
})
export class PersistentVolumeDetailComponent implements OnInit, OnDestroy {
  private readonly endpoint_ = EndpointManager.resource(Resource.persistentVolume);
  private readonly unsubscribe_ = new Subject<void>();

  private readonly kdState_: KdStateService = GlobalServicesModule.injector.get(KdStateService);

  persistentVolume: PersistentVolumeDetail;
  isInitialized = false;

  constructor(
    private readonly persistentVolume_: ResourceService<PersistentVolumeDetail>,
    private readonly actionbar_: ActionbarService,
    private readonly activatedRoute_: ActivatedRoute,
    private readonly notifications_: NotificationsService
  ) {}

  ngOnInit(): void {
    const resourceName = this.activatedRoute_.snapshot.params.resourceName;

    this.persistentVolume_
      .get(this.endpoint_.detail(), resourceName)
      .pipe(takeUntil(this.unsubscribe_))
      .subscribe((d: PersistentVolumeDetail) => {
        this.persistentVolume = d;
        this.notifications_.pushErrors(d.errors);
        this.actionbar_.onInit.emit(new ResourceMeta('Persistent Volume', d.objectMeta, d.typeMeta));
        this.isInitialized = true;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe_.next();
    this.unsubscribe_.complete();
    this.actionbar_.onDetailsLeave.emit();
  }

  getCapacityColumns(): string[] {
    return ['resourceName', 'quantity'];
  }

  getCapacityDataSource(): MatTableDataSource<CapacityItem> {
    const tableData = new MatTableDataSource<CapacityItem>();

    if (!this.isInitialized) {
      return tableData;
    }

    tableData.data = Object.keys(this.persistentVolume.capacity).map(
      key =>
        ({
          resourceName: key,
          quantity: this.persistentVolume.capacity[key],
        } as CapacityItem)
    );

    return tableData;
  }

  trackByCapacityItemName(_: number, item: CapacityItem): any {
    return item.resourceName;
  }

  getClaimHref(claimReference: string): string {
    let href = '';

    const splittedRef = claimReference.split('/');
    if (splittedRef.length === 2) {
      href = this.kdState_.href('persistentvolumeclaim', splittedRef[1], splittedRef[0]);
    }

    return href;
  }
}
