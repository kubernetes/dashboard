import NodeListCardController from './nodecard_controller';

/**
* Returns directive definition object for node card directive
*
* @return {!angular.Directive}
*/
export default function nodeCardDirective() {
  return {
    scope: {},
    bindToController: {
      'node': '=',
    },
    controller: NodeListCardController,
    controllerAs: 'ctrl',
    templateUrl: 'nodelist/nodecard.html',
  };
}
