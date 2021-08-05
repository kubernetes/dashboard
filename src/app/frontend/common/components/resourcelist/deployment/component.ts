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
import {Deployment, DeploymentList, Event, Metric} from '@api/root.api';
import {Observable} from 'rxjs';
import {ResourceListWithStatuses} from '@common/resources/list';
import {NotificationsService} from '@common/services/global/notifications';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {NamespacedResourceService} from '@common/services/resource/resource';
import {MenuComponent} from '../../list/column/menu/component';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';
import {Status} from '../statuses';

@Component({
  selector: 'kd-deployment-list',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeploymentListComponent extends ResourceListWithStatuses<DeploymentList, Deployment> {
  @Input() endpoint = EndpointManager.resource(Resource.deployment, true).list();
  @Input() showMetrics = false;
  cumulativeMetrics: Metric[];

  constructor(
    private readonly deployment_: NamespacedResourceService<DeploymentList>,
    notifications: NotificationsService,
    cdr: ChangeDetectorRef
  ) {
    super('deployment', notifications, cdr);
    this.id = ListIdentifier.deployment;
    this.groupId = ListGroupIdentifier.workloads;

    // Register status icon handlers
    this.registerBinding(
      'kd-success',
      r => r.pods.warnings.length === 0 && r.pods.pending === 0 && r.pods.running === r.pods.desired,
      Status.Running
    );
    this.registerBinding(
      'kd-muted',
      r => r.pods.warnings.length === 0 && (r.pods.pending > 0 || r.pods.running !== r.pods.desired),
      Status.Pending
    );
    this.registerBinding('kd-error', r => r.pods.warnings.length > 0, Status.Error);

    // Register action columns.
    this.registerActionColumn<MenuComponent>('menu', MenuComponent);

    // Register dynamic columns.
    this.registerDynamicColumn('namespace', 'name', this.shouldShowNamespaceColumn_.bind(this));
  }

  getResourceObservable(params?: HttpParams): Observable<DeploymentList> {
    return this.deployment_.get(this.endpoint, undefined, undefined, params);
  }

  map(deploymentList: DeploymentList): Deployment[] {
    this.cumulativeMetrics = deploymentList.cumulativeMetrics;
    return deploymentList.deployments;
  }

  getDisplayColumns(): string[] {
    return ['statusicon', 'name', 'images', 'labels', 'pods', 'created'];
  }

  hasErrors(deployment: Deployment): boolean {
    return deployment.pods.warnings.length > 0;
  }

  getEvents(deployment: Deployment): Event[] {
    return deployment.pods.warnings;
  }

  private shouldShowNamespaceColumn_(): boolean {
    return this.namespaceService_.areMultipleNamespacesSelected();
  }
}
