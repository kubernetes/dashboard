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

import {chromeState} from '../chrome/state';
import {addLogsStateParamsToUrl, LOGS_CONTAINER_STATE_PARAM} from '../common/params/params';
import {logsParentStatePlaceholder} from '../common/services/global/breadcrumbs';

import {LogsComponent} from './component';

export const logsFutureState: Ng2StateDeclaration = {
  name: 'logs.**',
  url: '/logs',
  loadChildren: './logs/module#LogsModule'
};

export const logsState: Ng2StateDeclaration = {
  parent: chromeState.name,
  name: 'log',
  url: addLogsStateParamsToUrl('/log') + `?${LOGS_CONTAINER_STATE_PARAM}`,
  data: {
    kdBreadcrumbs: {
      label: 'Logs',
      parent: logsParentStatePlaceholder,
    }
  },
  views: {
    '$default': {
      component: LogsComponent,
    }
  },
};
