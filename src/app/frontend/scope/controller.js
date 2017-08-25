// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

/**
 * @final
 */
export class ScopeController {
  /**
   * @param {!angular.$log} $log
   * @param {!angular.$resource} $resource
   * @param {!angular.$q} $q
   * @param {!angular.$timeout} $timeout
   * @param {!angular.$window} $window
   * @param {!backendApi.Scope} scope
   * @param {!angular.$sce} $sce
   * @param {!./../common/csrftoken/service.CsrfTokenService} kdCsrfTokenService
   * @ngInject
   */
  constructor($log, $resource, $q, $timeout, $window, scope, $sce, kdCsrfTokenService) {
    /** @export {!backendApi.Scope} */
    this.scope = scope;

    /** @private {!angular.$q} */
    this.q_ = $q;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /** @private {!angular.$sce} */
    this.sce_ = $sce;

    /** @private {!angular.$window} */
    this.window_ = $window;

    /** @public {boolean} */
    this.isDeployInProgress = false;

    /** @private {!angular.$timeout} */
    this.timeout_ = $timeout;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!angular.$q.Promise} */
    this.tokenPromise_ = kdCsrfTokenService.getTokenForAction('scope');

    /** @public {string} */
    this.iframeHeight = String(this.window_.innerHeight - 200).concat('px');

    /** @public {string} */
    this.scope.address = this.getSanitizedAddress(this.scope.address);

    this.window_.addEventListener('resize', () => {
      this.timeout_(() => {
        this.iframeHeight = String(this.window_.innerHeight - 200).concat('px');
      });
    });
  }

  /**
   * Returns a sanitized address for the iframe.
   * @export
   */
  getSanitizedAddress(url) {
    return this.sce_.trustAsResourceUrl(url);
  }

  /**
   * Pings until scope is up and ready.
   * @export
   */
  pingScope(tries) {
    if (tries >= 0) {
      let resource = this.resource_('api/v1/scope', {}, {get: {method: 'GET'}});
      resource.get(
          (response) => {
            if (response.deployed === false) {
              // wait 5 seconds before trying again
              this.timeout_(() => {
                this.pingScope(tries--);
              }, 5000);
            } else {
              this.log_.info('Scope has launched: ', response);
              this.scope.deployed = response.deployed;
              this.scope.address = this.getSanitizedAddress(response.address);
              this.isDeployInProgress = false;
              this.timeout_(() => {
                let iframe = document.getElementById('scope-iframe');
                iframe.src = iframe.src;
              }, 500);
            }
          },
          (err) => {
            this.log_.error(err);
          });
    }
  }

  /**
   * Deploys the scope application onto the cluster.
   * @return {!angular.$q.Promise|undefined}
   * @export
   */
  deployScope() {
    let defer = this.q_.defer();

    this.tokenPromise_.then(
        (token) => {
          let resource = this.resource_(
              'api/v1/scope', {}, {save: {method: 'POST', headers: {'X-CSRF-TOKEN': token}}});
          this.isDeployInProgress = true;
          resource.save(
              {},
              (response) => {
                defer.resolve(response);
                this.log_.info('Scope sucessfully deployed: ', response);
              },
              (err) => {
                defer.reject(err);
                this.log_.error('Error deploying scope:', err);
              });
        },
        (err) => {
          defer.reject(err);
          this.log_.error('Error deploying scope:', err);
        });

    defer.promise.finally(() => {
      this.log_.info('Checking if scope has launched');
      this.pingScope(5);
    });

    return defer.promise;
  }
}
