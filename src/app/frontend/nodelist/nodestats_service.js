/**
* Service for fetching node stats
*/
export default class NodeStatsService {
    /**
    * @param {$resource} $resource
    */
    constructor($resource) {
        this.$resource = $resource;
    }

    /**
    * Fetch node stats from api
    * @param {string} host
    * @return {$q.$promise}
    */
    getNodeStats(host) {
        let resource = this.$resource(`/api/nodes/${host}/stats`);
        return resource.get().$promise;
    }
}
