import DeployFromKpmController from './deployfromkpm_controller';

/**
 * Returns directive definition object for the deploy from kpm directive.
 * @return {!angular.Directive}
 */
export default function deployFromKpmDirective() {
  return {
    scope: {},
    bindToController: {
      'name': '=',
      'namespaces': '=',
      'detail': '=',
      'form': '=',
      'protocols': '=',
    },
    controller: DeployFromKpmController,
    controllerAs: 'ctrl',
    templateUrl: 'deploy/deployfromkpm.html',
  };
}
