import stateConfig from './nodelist_stateconfig';
import nodeCardDirective from './nodecard_directive';

/**
 * Angular module for the Node list view.
 */
export default angular.module(
                          'kubernetesDashboard.nodeList',
                          [
                            'ngMaterial',
                            'ngResource',
                            'ui.router',
                          ])
    .config(stateConfig)
    .directive('kdNodeCard', nodeCardDirective);
