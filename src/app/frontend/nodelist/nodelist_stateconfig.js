import NodeListController from './nodelist_controller';
import {stateName} from './nodelist_state';

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
    url: '/nodes',
    templateUrl: 'nodelist/nodelist.html',
  });
}
