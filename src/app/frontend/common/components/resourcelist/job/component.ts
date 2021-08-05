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
import {Event, Job, JobList, Metric} from '@api/root.api';
import {Observable} from 'rxjs';

import {ResourceListWithStatuses} from '@common/resources/list';
import {NotificationsService} from '@common/services/global/notifications';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {NamespacedResourceService} from '@common/services/resource/resource';
import {MenuComponent} from '../../list/column/menu/component';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';
import {Status} from '../statuses';

@Component({
  selector: 'kd-job-list',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobListComponent extends ResourceListWithStatuses<JobList, Job> {
  @Input() title: string;
  @Input() endpoint = EndpointManager.resource(Resource.job, true).list();
  @Input() showMetrics = false;
  cumulativeMetrics: Metric[];

  constructor(
    private readonly job_: NamespacedResourceService<JobList>,
    notifications: NotificationsService,
    cdr: ChangeDetectorRef
  ) {
    super('job', notifications, cdr);
    this.id = ListIdentifier.job;
    this.groupId = ListGroupIdentifier.workloads;

    // Register status icon handlers
    this.registerBinding('kd-success', r => r.podInfo.warnings.length === 0 && r.podInfo.pending === 0, Status.Running);
    this.registerBinding('kd-warning', r => r.podInfo.warnings.length === 0 && r.podInfo.pending > 0, Status.Pending);
    this.registerBinding('kd-error', r => r.podInfo.warnings.length > 0, Status.Error);

    // Register action columns.
    this.registerActionColumn<MenuComponent>('menu', MenuComponent);

    // Register dynamic columns.
    this.registerDynamicColumn('namespace', 'name', this.shouldShowNamespaceColumn_.bind(this));
  }

  getResourceObservable(params?: HttpParams): Observable<JobList> {
    return this.job_.get(this.endpoint, undefined, undefined, params);
  }

  map(jobList: JobList): Job[] {
    this.cumulativeMetrics = jobList.cumulativeMetrics;
    return jobList.jobs;
  }

  getDisplayColumns(): string[] {
    return ['statusicon', 'name', 'images', 'labels', 'pods', 'created'];
  }

  hasErrors(job: Job): boolean {
    return job.podInfo.warnings.length > 0;
  }

  getEvents(job: Job): Event[] {
    return job.podInfo.warnings;
  }

  private shouldShowNamespaceColumn_(): boolean {
    return this.namespaceService_.areMultipleNamespacesSelected();
  }
}
