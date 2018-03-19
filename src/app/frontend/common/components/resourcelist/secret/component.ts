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
import {Component, Input} from '@angular/core';
import {StateService} from '@uirouter/core';
import {Observable} from 'rxjs/Observable';
import {Secret, SecretList} from 'typings/backendapi';
import {secretState} from '../../../../resource/config/secret/state';
import {ResourceListBase} from '../../../resources/list';
import {NamespaceService} from '../../../services/global/namespace';
import {NotificationsService} from '../../../services/global/notifications';
import {EndpointManager, Resource} from '../../../services/resource/endpoint';
import {NamespacedResourceService} from '../../../services/resource/resource';
import {ListGroupIdentifiers, ListIdentifiers} from '../groupids';

@Component({selector: 'kd-secret-list', templateUrl: './template.html'})
export class SecretListComponent extends ResourceListBase<SecretList, Secret> {
  @Input() endpoint = EndpointManager.resource(Resource.secret, true).list();

  constructor(
      state: StateService, private readonly secret_: NamespacedResourceService<SecretList>,
      notifications: NotificationsService, private readonly namespaceService_: NamespaceService) {
    super(secretState.name, state, notifications);
    this.id = ListIdentifiers.secret;
    this.groupId = ListGroupIdentifiers.config;

    // Register dynamic columns.
    this.registerDynamicColumn('namespace', 'name', this.shouldShowNamespaceColumn_.bind(this));
  }

  getResourceObservable(params?: HttpParams): Observable<SecretList> {
    return this.secret_.get(this.endpoint, undefined, params);
  }

  map(secretList: SecretList): Secret[] {
    return secretList.secrets;
  }

  getDisplayColumns(): string[] {
    return ['name', 'labels', 'type', 'age'];
  }

  private shouldShowNamespaceColumn_(): boolean {
    return this.namespaceService_.areMultipleNamespacesSelected();
  }
}
