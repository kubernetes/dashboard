export default class NodeStatsService {
    constructor($resource) {
        this.$resource = $resource;
    }

    getNodeStats(host) {
        let resource = this.$resource(`/api/nodes/${host}/stats`);
        return resource.get().$promise;
    }
}
