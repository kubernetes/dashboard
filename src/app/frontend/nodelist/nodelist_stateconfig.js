import NodeListController from './nodelist_controller';
import {stateName, stateUrl} from './nodelist_state';

/**
 * Configures states for the node list view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    controller: NodeListController,
    controllerAs: 'ctrl',
    url: stateUrl,
    resolve: {
      'nodes': resolveNodes,
    },
    templateUrl: 'nodelist/nodelist.html',
  });
}

/**
* @param {!angular.$resource} $resource
* @return {!angular.$q.Promise}
* @ngInject
*/
function resolveNodes($resource) {
  /** @type {!angular.Resource<!backendApi.NodeList>} */
  let resource = $resource('/api/nodes');
  return resource.get().$promise;
}
