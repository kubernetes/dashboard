import {DaemonSetDetailController} from 'daemonsetdetail/daemonsetdetail_controller';
import daemonSetDetailModule from 'daemonsetdetail/daemonsetdetail_module';

describe('DaemonSet Detail controller', () => {

  beforeEach(() => { angular.mock.module(daemonSetDetailModule.name); });

  it('should initialize daemon set detail', angular.mock.inject(($controller) => {
    let data = {};
    /** @type {!DaemonSetDetailController} */
    let ctrl = $controller(DaemonSetDetailController, {daemonSetDetail: data});

    expect(ctrl.daemonSetDetail).toBe(data);
  }));
});
