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

import {Component} from '@angular/core';
import {Node} from '@api/backendapi';
import {StateService} from '@uirouter/core';

import {ResourceList, ResourceListBase, ResourceListWithStatuses} from '../../../../common/resources/resourcelist';
import {NodeService} from '../../../../common/services/resource/node';
import {nodeDetailState} from '../detail/state';

@Component({
  selector: 'kd-node-list',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class NodeListComponent extends ResourceListWithStatuses<Node> {
  constructor(state: StateService, private nodeService_: NodeService) {
    super(nodeDetailState.name, state, nodeService_.getNodes());

    // Override default warning icon.
    this.setWarningIcon('help');
  }

  isInErrorState(resource: Node): boolean {
    return resource.ready === 'False';
  }

  isInWarningState(resource: Node): boolean {
    return resource.ready === 'Unknown';
  }

  isInSuccessState(resource: Node): boolean {
    return resource.ready === 'True';
  }

  getDisplayedColumns(): string[] {
    return ['status', 'name', 'labels', 'ready', 'cpureq', 'cpulim', 'memreq', 'memlim', 'age'];
  }
}
