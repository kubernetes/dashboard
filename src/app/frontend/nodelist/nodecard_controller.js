export default class NodeListCardController {
    constructor($state, $scope) {
        this.node;

        this._state = $state;

        $scope.labels = Array.apply(null, Array(12)).map(() => '');
        $scope.series = ['CPU', 'Memory'];
        $scope.colors = ['#326DE6', '#e5be32'];
        $scope.options = {
            pointDot: false,
        };

        $scope.data = [
            this.getZeroedValues(),
            this.getZeroedValues(),
        ];

        const randVal = () => Math.floor(Math.random() * 100);

        setInterval(() => {
            this.addNewDataValues($scope, [randVal(), randVal()]);
        }, 5000);
    }

    addNewDataValues($scope, vals) {
        $scope.data = $scope.data.map((arr, i) => {
            arr.shift();
            arr.push(vals[i]);
            return arr;
        });
        $scope.$apply();
    }

    getZeroedValues() {
        return Array.apply(null, Array(12)).map(() => 0);
    }

    getFormattedLabels() {
        return Object.keys(this.node.labels).map(key => {
            return `${key}: ${this.node.labels[key]}`;
        });
    }
}

NodeListCardController.$inject = ['$state', '$scope'];
