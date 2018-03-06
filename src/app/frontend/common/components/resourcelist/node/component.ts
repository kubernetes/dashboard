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
import {Node, NodeList} from '@api/backendapi';
import {StateService} from '@uirouter/core';
import {Observable} from 'rxjs/Observable';
import {nodeState} from '../../../../resource/cluster/node/state';
import {ResourceListWithStatuses} from '../../../resources/list';
import {NotificationsService} from '../../../services/global/notifications';
import {EndpointManager, Resource} from '../../../services/resource/endpoint';
import {ResourceService} from '../../../services/resource/resource';
import {ListGroupIdentifiers, ListIdentifiers} from '../groupids';

@Component({
  selector: 'kd-node-list',
  templateUrl: './template.html',
})
export class NodeListComponent extends ResourceListWithStatuses<NodeList, Node> {
  @Input() endpoint = EndpointManager.resource(Resource.node).list();

  constructor(
      state: StateService, private readonly node_: ResourceService<NodeList>,
      notifications: NotificationsService) {
    super(nodeState.name, state, notifications);
    this.id = ListIdentifiers.node;
    this.groupId = ListGroupIdentifiers.cluster;

    // Register status icon handlers
    this.registerBinding(this.icon.checkCircle, 'kd-success', this.isInSuccessState);
    this.registerBinding(this.icon.help, 'kd-muted', this.isInUnknownState);
    this.registerBinding(this.icon.error, 'kd-error', this.isInErrorState);
  }

  getResourceObservable(params?: HttpParams): Observable<NodeList> {
    return this.node_.get(this.endpoint, undefined, params);
  }

  map(nodeList: NodeList): Node[] {
    return nodeList.nodes;
  }

  isInErrorState(resource: Node): boolean {
    return resource.ready === 'False';
  }

  isInUnknownState(resource: Node): boolean {
    return resource.ready === 'Unknown';
  }

  isInSuccessState(resource: Node): boolean {
    return resource.ready === 'True';
  }

  getDisplayColumns(): string[] {
    return ['statusicon', 'name', 'labels', 'ready', 'cpureq', 'cpulim', 'memreq', 'memlim', 'age'];
  }
}
