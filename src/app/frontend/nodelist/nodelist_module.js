import stateConfig from './nodelist_stateconfig';
import nodeCardDirective from './nodecard_directive';
import {NodeStatsService} from './nodestats_service';

/**
 * Angular module for the Node list view.
 */
export default angular.module(
                          'kubernetesDashboard.nodeList',
                          [
                            'ngMaterial',
                            'ngResource',
                            'ui.router',
                            'chart.js',
                          ])
    .config(stateConfig)
    .directive('kdNodeCard', nodeCardDirective)
    .service('nodeStatsService', NodeStatsService);
