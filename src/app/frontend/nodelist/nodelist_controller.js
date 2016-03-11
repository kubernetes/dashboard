/**
 * Controller for the node list view
 * @final
 */
export default class NodeListController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!backendApi.NodeList} nodes
   * @ngInject
   */
  constructor($state, nodes) {
    /** @export {!Array<!backendApi.Node>} */
    this.nodes = nodes.nodes;

    /** @private {!ui.router.$state} */
    this.state_ = $state;
  }
}
