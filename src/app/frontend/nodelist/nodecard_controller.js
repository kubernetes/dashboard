export default class NodeListCardController {
    constructor($state, $scope, nodeStatsService) {
        this.node;

        this._state = $state;
        this._scope = $scope;
        this._nodeService = nodeStatsService;

        this.updateData = this.updateData.bind(this);
        this.fetchNodeStatData = this.fetchNodeStatData.bind(this);

        this.initChartOptions();

        if (this.node.status === 'Ready') {
            this.fetchNodeStatData();
            this.pollNodeStatData();
        }
    }

    initChartOptions() {
        this._scope.series = ['CPU (%)', 'Memory (%)'];
        this._scope.colors = ['#326DE6', '#e5be32'];
        this._scope.options = {
            pointDot: false,
            animation: false,
        };
    }

    pollNodeStatData() {
        setInterval(this.fetchNodeStatData, 2000);
    }

    fetchNodeStatData() {
        this._nodeService
            .getNodeStats(this.node.name)
            .then(this.updateData);
    }

    updateData(data) {
        let cpu = [];
        let mem = [];

        data.stats.forEach(stat => {
            cpu.push(Math.round(stat.cpuPercentage));
            mem.push(Math.round(stat.memoryPercentage));
        });

        this._scope.data = [cpu, mem];
        this._scope.labels = Array.apply(null, Array(cpu.length)).map(() => '');
    }

    getFormattedLabels() {
        return Object.keys(this.node.labels).map(key => {
            return `${key}: ${this.node.labels[key]}`;
        });
    }
}
