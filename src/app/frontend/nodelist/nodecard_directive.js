import NodeListCardController from './nodecard_controller';


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
