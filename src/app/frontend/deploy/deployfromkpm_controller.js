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
  constructor($log, $http, $state, $resource, $q, $mdDialog) {
    // Dependencies


    this._http = $http;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!angular.$q} */
    this.q_ = $q;

    /** @private {!angular.$log} */
    this.log_= $log

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;

    /** @export {string} */
    this.packageName = "";

    /**
     * List of available namespaces.
     *
     * Initialized from the scope.
     * @export {!Array<string>}
     */
    this.namespaces;

    /**
     * Currently chosen namespace.
     * @export {string}
     */
    this.namespace = this.namespaces[0];

    /** @export {boolean} */
    this.dryRun = false;

    /** @export {string} */
    this.deployStatus = 'none';

    /** @export  */
    this.resources = [];
  }

  /**
   * Perform POST request on KPM backend
   * @export
   */
  deploy() {
    return this.performQuery('deploy');
  }

  /**
   * Perform DELETE request on KPM backend
   * @export
   */
  remove() {
    return this.performQuery('delete');
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
        }
        else {
          this.namespace = this.namespaces[0];
        }
      },
      () => { this.namespace = this.namespaces[0]; });
  }


  /**
   * Queries all secrets for the given namespace.
   * @param {string} method
   * @export
   */
  performQuery(method) {
    var url = this.backend_url(method);
    var self = this;
    this.deployStatus = 'ongoing';
    this._http({
      method: 'POST',
      url:  url,
      params: {
        dryRun: this.dryRun
      },
      data: {}
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

  /**
   * Queries all secrets for the given namespace.
   * @param {string} method
   * @return {string} url
   * @export
   */
  backend_url(method) {
    var url = "/api/v1/appdeploymentfromkpm/" + this.namespace +
      "/" + this.packageName  + "/" + method;
    return url;
  }

  /**
   * Return to home
   * @export
   */
  back() {
    return this.state_.go('replicationcontrollers');
  }

  /**
   * Search package names matching user input
   * @return promise
   * @export
   */
  querySearch(search) {
    var deferred = this.q_.defer();
    this._http({
      method: 'GET',
      url: 'https://api.kpm.sh/api/v1/packages.json'
    })
    .success(function(data) {
//      var names = data.map((item) => item.name);
 //     console.log(names);
      // FIXME: perform filtering server-side
      deferred.resolve(data.filter((item) => item.name.indexOf(search) != -1));
    })
    return deferred.promise;
  }
}
