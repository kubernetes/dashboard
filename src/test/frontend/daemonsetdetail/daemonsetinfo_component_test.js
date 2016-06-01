import daemonSetDetailModule from 'daemonsetdetail/daemonsetdetail_module';

describe('Daemon Set Info controller', () => {
  /**
* Daemon Set Info controller.
* @type {!DaemonSetInfoController}
*/
  let ctrl;

  beforeEach(() => {
    angular.mock.module(daemonSetDetailModule.name);

    angular.mock.inject(
        ($componentController) => { ctrl = $componentController('kdDaemonSetInfo', {}); });
  });

  it('should return true when all desired pods are running', () => {
    // given
    ctrl.daemonSet = {
      podInfo: {
        running: 0,
        desired: 0,
      },
    };

    // then
    expect(ctrl.areDesiredPodsRunning()).toBeTruthy();
  });

  it('should return false when not all desired pods are running', () => {
    // given
    ctrl.daemonSet = {
      podInfo: {
        running: 0,
        desired: 1,
      },
    };

    // then
    expect(ctrl.areDesiredPodsRunning()).toBeFalsy();
  });
});
