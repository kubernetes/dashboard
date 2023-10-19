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

import {DefaultActionbarComponent} from './default/component';
import {LogsDefaultActionbarComponent} from './logsdefault/component';
import {LogsExecDefaultActionbarComponent} from './logsexecdefault/component';
import {LogsScaleDefaultActionbarComponent} from './logsscaledefault/component';
import {ScaleDefaultActionbarComponent} from './scaledefault/component';
import {TriggerDefaultActionbarComponent} from './triggerdefault/component';
import {PinDefaultActionbarComponent} from './pindefault/component';

export const DEFAULT_ACTIONBAR = {
  path: '',
  component: DefaultActionbarComponent,
  outlet: 'actionbar',
};

export const LOGS_DEFAULT_ACTIONBAR = {
  path: '',
  component: LogsDefaultActionbarComponent,
  outlet: 'actionbar',
};

export const LOGS_EXEC_DEFAULT_ACTIONBAR = {
  path: '',
  component: LogsExecDefaultActionbarComponent,
  outlet: 'actionbar',
};

export const LOGS_SCALE_DEFAULT_ACTIONBAR = {
  path: '',
  component: LogsScaleDefaultActionbarComponent,
  outlet: 'actionbar',
};

export const PIN_DEFAULT_ACTIONBAR = {
  path: '',
  component: PinDefaultActionbarComponent,
  outlet: 'actionbar',
};

export const SCALE_DEFAULT_ACTIONBAR = {
  path: '',
  component: ScaleDefaultActionbarComponent,
  outlet: 'actionbar',
};

export const TRIGGER_DEFAULT_ACTIONBAR = {
  path: '',
  component: TriggerDefaultActionbarComponent,
  outlet: 'actionbar',
};
