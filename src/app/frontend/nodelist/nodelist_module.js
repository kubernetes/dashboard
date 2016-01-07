import stateConfig from './nodelist_stateconfig';

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
    .config(stateConfig);
