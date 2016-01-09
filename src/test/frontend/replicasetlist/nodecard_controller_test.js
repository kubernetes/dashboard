import NodeCardController from 'nodelist/nodecard_controller';
import nodelistModule from 'nodelist/nodelist_module';

describe('Node card controller', () => {
    let ctrl;

    beforeEach(() => {
        angular.mock.module(nodelistModule.name);
        angular.mock.inject(($controller, $rootScope) => {
            let $scope = $rootScope.$new();
            ctrl = $controller(NodeCardController, {$scope});
        });
    });

    it('should, given updated chart data, update scope data and labels', () => {
        // given
        let data = {
            stats: [
                {
                    cpuPercentage: 12.092340892,
                    memoryPercentage: 65.64563523,
                },
                {
                    cpuPercentage: 12.092340892,
                    memoryPercentage: 65.64563523,
                },
            ],
        };

        ctrl.updateData(data);

        // then
        expect(ctrl._scope.data).toEqual([[12, 12], [66, 66]]);
        expect(ctrl._scope.labels).toEqual(['', '']);
    });

    describe('getFormattedLabels', () => {
        it('should return labels key and value merged into a string', () => {
            ctrl.node = {};
            ctrl.node.labels = {
                label: 'value',
                anotherLabel: 'value',
            };

            expect(ctrl.getFormattedLabels()).toEqual(['label: value', 'anotherLabel: value']);
        });
    });
});
