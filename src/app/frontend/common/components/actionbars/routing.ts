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

import {DefaultActionbar} from './default/component';
import {LogsDefaultActionbar} from './logsdefault/component';
import {LogsExecDefaultActionbar} from './logsexecdefault/component';
import {LogsScaleDefaultActionbar} from './logsscaledefault/component';
import {ScaleDefaultActionbar} from './scaledefault/component';
import {TriggerDefaultActionbar} from './triggerdefault/component';
import {PinDefaultActionbar} from './pindefault/component';

export const DEFAULT_ACTIONBAR = {
  path: '',
  component: DefaultActionbar,
  outlet: 'actionbar',
};

export const LOGS_DEFAULT_ACTIONBAR = {
  path: '',
  component: LogsDefaultActionbar,
  outlet: 'actionbar',
};

export const LOGS_EXEC_DEFAULT_ACTIONBAR = {
  path: '',
  component: LogsExecDefaultActionbar,
  outlet: 'actionbar',
};

export const LOGS_SCALE_DEFAULT_ACTIONBAR = {
  path: '',
  component: LogsScaleDefaultActionbar,
  outlet: 'actionbar',
};

export const PIN_DEFAULT_ACTIONBAR = {
  path: '',
  component: PinDefaultActionbar,
  outlet: 'actionbar',
};

export const SCALE_DEFAULT_ACTIONBAR = {
  path: '',
  component: ScaleDefaultActionbar,
  outlet: 'actionbar',
};

export const TRIGGER_DEFAULT_ACTIONBAR = {
  path: '',
  component: TriggerDefaultActionbar,
  outlet: 'actionbar',
};
