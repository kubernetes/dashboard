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

import {Ng2StateDeclaration} from '@uirouter/angular';
import {EndpointManager} from '../../../../common/services/resource/endpoint';
import {workloadsState} from '../../state';
import {stateName, stateUrl} from '../state';
import {PodListComponent} from './component';

export const podListState: Ng2StateDeclaration = {
  name: `${stateName}.list`,
  url: stateUrl,
  component: PodListComponent,
  data: {
    kdBreadcrumbs: {
      label: 'Pods',
      parent: workloadsState.name,
    },
  },
  resolve: [
    {
      token: 'endpoint',
      resolveFn: EndpointManager.pod.list,
    },
  ],
};
