/**
* Controller for the Node card
* @final
*/
export default class NodeCardController {
  /**
  * @param {!angular.Scope} $scope
  * @param {!angular.$interval} $interval
  * @param {!./nodestats_service.NodeStatsService} nodeStatsService
  * @ngInject
  */
  constructor($scope, $interval, nodeStatsService) {
    /**
    * Initialized from the scope
    * @export {!backendApi.Node}
    */
    this.node;

    /**
    * @private {!angular.Scope}
    */
    this._scope = $scope;

    /**
    * @private {!angular.$interval}
    */
    this._interval = $interval;

    /**
    * @private {!./nodestats_service.NodeStatsService}
    */
    this._nodeService = nodeStatsService;

    // bind to self
    this.fetchNodeStatData = this.fetchNodeStatData.bind(this);
  }

  /**
  * @return {boolean}
  * @export
  */
  isStatsAvailable() { return this.node.status === 'Ready'; }

  /**
  * Init fetch of chart data
  * @export
  */
  getChartData() {
    // only load if stats are available
    if (this.isStatsAvailable()) {
      // initialize chart options
      this.initChartOptions();

      // fetch data
      this.fetchNodeStatData();
      this.pollNodeStatData();
    }
  }

  /**
  * Initializes all chart options
  */
  initChartOptions() {
    this._scope.series = ['CPU (%)', 'Memory (%)'];
    this._scope.colors = ['#326DE6', '#e5be32'];
    this._scope.options = {
      pointDot: false,
      animation: false,
    };
  }

  /**
  * Polls the node stats endpoint indefinitely every other second
  */
  pollNodeStatData() {
    const pollInterval = this._interval(this.fetchNodeStatData, 2000);
    this._scope.$on('$destroy', () => { this._interval.cancel(pollInterval); });
  }

  /**
  * Fetch node stat data
  */
  fetchNodeStatData() {
    this._nodeService.getNodeStats(this.node.name).then((data) => this.updateData(data));
  }

  /**
  * Update chart data
  * @param {!backendApi.NodeStats} data
  */
  updateData(data) {
    let cpu = [];
    let mem = [];

    data.stats.forEach((stat) => {
      cpu.push(Math.round(stat.cpuPercentage));
      mem.push(Math.round(stat.memoryPercentage));
    });

    this._scope.data = [cpu, mem];
    this._scope.labels = Array.apply(null, Array(cpu.length)).map(() => '');
  }

  /**
  * @return {Array<string>}
  * @export
  */
  getFormattedLabels() {
    return Object.keys(this.node.labels).map((key) => {
      return `${key}: ${this.node.labels[key]}`;
    });
  }
}
