import {DefaultActionbar} from './default/component';
import {LogsDefaultActionbar} from './logsdefault/component';
import {LogsExecDefaultActionbar} from './logsexecdefault/component';
import {LogsScaleDefaultActionbar} from './logsscaledefault/component';
import {ScaleDefaultActionbar} from './scaledefault/component';
import {TriggerDefaultActionbar} from './triggerdefault/component';

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
