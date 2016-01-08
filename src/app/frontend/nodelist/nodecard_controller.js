export default class NodeListCardController {
    constructor($state) {
        this.node;

        this._state = $state;
    }

    getFormattedLabels() {
        return Object.keys(this.node.labels).map(key => {
            return `${key}: ${this.node.labels[key]}`;
        });
    }
}
