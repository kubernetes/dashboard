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

import {addResourceStateParamsToUrl} from '../../../../common/params/params';
import {stateName, stateUrl} from '../state';

import {ActionbarComponent} from './actionbar/component';
import {NamespaceDetailComponent} from './component';

export const namespaceDetailState: Ng2StateDeclaration = {
  name: `${stateName}.detail`,
  url: addResourceStateParamsToUrl(stateUrl),
  data: {
    kdBreadcrumbs: {
      label: 'resourceName',
      parent: 'namespace.list',
    },
  },
  views: {
    '$default': {
      component: NamespaceDetailComponent,
    },
    'actionbar@chrome': {
      component: ActionbarComponent,
    }
  },
};
