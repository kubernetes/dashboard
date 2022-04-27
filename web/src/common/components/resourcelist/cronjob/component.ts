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

import {HttpParams} from '@angular/common/http';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {CronJob, CronJobList, Metric} from '@api/root.api';
import {ResourceListWithStatuses} from '@common/resources/list';
import {NotificationsService} from '@common/services/global/notifications';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {NamespacedResourceService} from '@common/services/resource/resource';
import {Observable} from 'rxjs';
import {MenuComponent} from '../../list/column/menu/component';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';
import {Status} from '../statuses';

@Component({
  selector: 'kd-cron-job-list',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CronJobListComponent extends ResourceListWithStatuses<CronJobList, CronJob> {
  @Input() endpoint = EndpointManager.resource(Resource.cronJob, true).list();
  @Input() showMetrics = false;
  cumulativeMetrics: Metric[];

  constructor(
    private readonly cronJob_: NamespacedResourceService<CronJobList>,
    notifications: NotificationsService,
    cdr: ChangeDetectorRef
  ) {
    super('cronjob', notifications, cdr);
    this.id = ListIdentifier.cronJob;
    this.groupId = ListGroupIdentifier.workloads;

    // Register status icon handlers
    this.registerBinding('kd-success', r => !r.suspend, Status.Running);
    this.registerBinding('kd-muted', r => r.suspend, Status.Suspended);

    // Register action columns.
    this.registerActionColumn<MenuComponent>('menu', MenuComponent);

    // Register dynamic columns.
    this.registerDynamicColumn('namespace', 'name', this.shouldShowNamespaceColumn_.bind(this));
  }

  getResourceObservable(params?: HttpParams): Observable<CronJobList> {
    return this.cronJob_.get(this.endpoint, undefined, undefined, params);
  }

  map(cronJobList: CronJobList): CronJob[] {
    this.cumulativeMetrics = cronJobList.cumulativeMetrics;
    return cronJobList.items;
  }

  getDisplayColumns(): string[] {
    return ['statusicon', 'name', 'images', 'labels', 'schedule', 'suspend', 'active', 'lastschedule', 'created'];
  }

  private shouldShowNamespaceColumn_(): boolean {
    return this.namespaceService_.areMultipleNamespacesSelected();
  }
}
