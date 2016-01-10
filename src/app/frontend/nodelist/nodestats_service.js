/**
* Service for fetching node stats
* @final
*/
export class NodeStatsService {
  /**
  * @param {!angular.$resource} $resource
  * @ngInject
  */
  constructor($resource) { this.$resource = $resource; }

  /**
  * Fetch node stats from api
  * @param {string} host
  * @return {Promise}
  */
  getNodeStats(host) {
    let resource = this.$resource(`/api/nodes/${host}/stats`);
    return resource.get().$promise;
  }
}
