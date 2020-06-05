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
import {Event, EventList} from '@api/backendapi';
import {Observable} from 'rxjs/Observable';

import {ResourceListWithStatuses} from '../../../resources/list';
import {NotificationsService} from '../../../services/global/notifications';
import {NamespacedResourceService} from '../../../services/resource/resource';
import {ListGroupIdentifier, ListIdentifier} from '../groupids';

const EVENT_TYPE_WARNING = 'Warning';

@Component({
  selector: 'kd-event-list',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventListComponent extends ResourceListWithStatuses<EventList, Event> implements OnInit {
  @Input() endpoint: string;

  constructor(
    private readonly eventList: NamespacedResourceService<EventList>,
    notifications: NotificationsService,
    cdr: ChangeDetectorRef,
  ) {
    super('', notifications, cdr);
    this.id = ListIdentifier.event;
    this.groupId = ListGroupIdentifier.none;

    // Register status icon handler
    this.registerBinding(this.icon.warning, 'kd-warning', this.isWarning);
    this.registerBinding(this.icon.none, '', this.isNormal.bind(this));
  }

  ngOnInit(): void {
    if (this.endpoint === undefined) {
      throw Error('Endpoint is a required parameter of event list.');
    }

    super.ngOnInit();
  }

  isWarning(event: Event): boolean {
    return event.type === EVENT_TYPE_WARNING;
  }

  isNormal(event: Event): boolean {
    return !this.isWarning(event);
  }

  getResourceObservable(params?: HttpParams): Observable<EventList> {
    return this.eventList.get(this.endpoint, undefined, undefined, params);
  }

  map(eventList: EventList): Event[] {
    return eventList.events;
  }

  getDisplayColumns(): string[] {
    return ['statusicon', 'message', 'source', 'subobject', 'count', 'firstseen', 'lastseen'];
  }
}
