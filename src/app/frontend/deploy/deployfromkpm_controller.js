import showNamespaceDialog from './createnamespace_dialog';

/**
 * Controller for the deploy from kpm directive.
 *
 * @final
 */
export default class DeployFromKpmController {
  /**
   * @param {!angular.$log} $log
   * @param {!ui.router.$state} $state
   * @param {!angular.$resource} $resource
   * @param {!angular.$q} $q
   * @param {!md.$dialog} $mdDialog
   * @ngInject
   */
  constructor($http, $scope, $log, $state, $resource, $q, $mdDialog) {
      // Dependencies
      this._http = $http;
      this._state = $state;
      this._q = $q;

      this.namespaces;
      this.packageName = '';
      this.namespace = this.namespaces[0];

      this.kpmBackendUrl = 'http://localhost:5000/api/v1/';
      this.deployStatus = 'none';
      this.resources = [];
      this.mdDialog_ = $mdDialog;
  }

  /**
   * Perform POST request on KPM backend
   */
  deploy() {
    return this.performQuery('POST');
  }


  /**
   * Perform DELETE request on KPM backend
   */
  remove() {
    return this.performQuery('DELETE');
  }

  /**
   * Displays new namespace creation dialog.
   *
   * @param {!angular.Scope.Event} event
   * @export
   */
  handleNamespaceDialog(event) {
    showNamespaceDialog(this.mdDialog_, event, this.namespaces)
        .then(
            /**
             * Handles namespace dialog result. If namespace was created successfully then it
             * will be selected, otherwise first namespace will be selected.
             *
             * @param {string|undefined} answer
             */
            (answer) => {
              if (answer) {
                this.namespace = answer;
                this.namespaces = this.namespaces.concat(answer);
              } else {
                this.namespace = this.namespaces[0];
              }
            },
            () => { this.namespace = this.namespaces[0]; });
  }

  performQuery(method) {
    var url = this.kpmBackendUrl + this.packageName;
    var self = this;
    this.deployStatus = 'ongoing';
    this._http({
      method: method,
      url:  url,
      data: {
        namespace: this.namespace
      }
    })
    .success(function(data) {
      self.deployStatus = 'success';
      self.resources = data.result;
    })
    .error(function(data) {
      self.deployStatus = 'error';
      self.resources = [];
    });
    return console.log("deploy " + this.packageName);
  }

  back() {
    return this._state.go('replicationcontrollers');
  }

  /**
   * Search package names matching user input
   * @return promise
   */
  querySearch(search) {
    var deferred = this._q.defer();
    this._http({
      method: 'GET',
      url: 'https://api.kpm.sh/api/v1/packages.json'
    })
    .success(function(data) {
      // FIXME: perform filtering server-side
      deferred.resolve(data.filter(function(item) {
        return item.name.indexOf(search) != -1;
      }));
    })
    return deferred.promise;
  }
}
