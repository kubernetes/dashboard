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
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {Event, EventList} from '@api/root.api';

import {ResourceListWithStatuses} from '@common/resources/list';
import {NotificationsService} from '@common/services/global/notifications';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {NamespacedResourceService} from '@common/services/resource/resource';
import {Observable} from 'rxjs';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';
import {Status} from '../statuses';

@Component({
  selector: 'kd-event-list',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventListComponent extends ResourceListWithStatuses<EventList, Event> implements OnInit {
  @Input() endpoint: string;

  private _isStandalone = false;
  private readonly _eventTypeWarning = 'Warning';

  get expanded(): boolean {
    return this.totalItems > 0 || this._isStandalone;
  }

  constructor(
    private readonly _eventList: NamespacedResourceService<EventList>,
    notifications: NotificationsService,
    cdr: ChangeDetectorRef
  ) {
    super('', notifications, cdr);
    this.id = ListIdentifier.event;
    this.groupId = ListGroupIdentifier.none;

    // Register status icon handler
    this.registerBinding('kd-warning', e => e.type === this._eventTypeWarning, Status.Warning);
    this.registerBinding('kd-hidden', e => e.type !== this._eventTypeWarning, Status.Normal);

    // Register dynamic columns.
    this.registerDynamicColumn('namespace', 'name', this.shouldShowNamespaceColumn_.bind(this));
    this.registerDynamicColumn('object', 'source', this.shouldShowObjectColumn_.bind(this));
    this.registerDynamicColumn('subobject', 'source', this.shouldShowSubObjectColumn_.bind(this));
  }

  ngOnInit(): void {
    if (!this.endpoint) {
      this.endpoint = EndpointManager.resource(Resource.event, true).list();
      this._isStandalone = true;
    }

    super.ngOnInit();
  }

  getResourceObservable(params?: HttpParams): Observable<EventList> {
    return this._eventList.get(this.endpoint, undefined, undefined, params);
  }

  map(eventList: EventList): Event[] {
    return eventList.events;
  }

  getDisplayColumns(): string[] {
    return ['statusicon', 'name', 'reason', 'message', 'source', 'count', 'firstSeen', 'lastSeen'];
  }

  getObjectHref(kind: string, name: string, namespace: string): string {
    if (!Object.values(Resource).includes(kind.toLowerCase() as Resource)) {
      return '';
    }

    return this.kdState_.href(kind.toLowerCase(), name, namespace);
  }

  private shouldShowNamespaceColumn_(): boolean {
    return this.namespaceService_.areMultipleNamespacesSelected() && this._isStandalone;
  }

  private shouldShowObjectColumn_(): boolean {
    return this._isStandalone;
  }

  private shouldShowSubObjectColumn_(): boolean {
    return !this._isStandalone;
  }
}
