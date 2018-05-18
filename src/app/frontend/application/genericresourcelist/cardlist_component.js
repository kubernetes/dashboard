// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @final
 */
class ApplicationGenericResourceCardListController {
  /**
   * @param {!angular.$resource} $resource
   * @param {!ui.router.$stateParams} $stateParams
   * @param {!./../../common/namespace/service.NamespaceService} kdNamespaceService
   * @param {!./../../common/dataselect/service.DataSelectService} kdDataSelectService
   * @ngInject
   */
  constructor($resource, $stateParams, kdNamespaceService, kdDataSelectService) {
    this.$resource_ = $resource;
    this.$stateParams_ = $stateParams;
    this.kdNamespaceService_ = kdNamespaceService;
    this.kdDataSelectService_ = kdDataSelectService;

    /** @export {!backendApi.ApplicationGenericResourceList} */
    this.applicationGenericResourceList = {listMeta: {totalItems: 0}, errors: [], resources: []};
    /** @export {!string} - Initialized from binding. */
    this.applicationName;
    /** @export {!string} - Initialized from binding. */
    this.kindName;
    /** @export {!string} - Initialized from binding. */
    this.groupName;
    /** @export {!angular.Resource} */
    this.applicationGenericResourceListResource;
  }

  $onInit() {
    this.applicationGenericResourceListResource = this.$resource_(
      `api/v1/application/${this.$stateParams_.objectNamespace}/${this.applicationName}/${
        this.groupName
      }/${this.kindName}`
    );

    const query = this.kdDataSelectService_.getDefaultResourceQuery(this.$stateParams_.namespace);
    this.applicationGenericResourceListResource.get(query).$promise.then((result) => {
      this.applicationGenericResourceList = result;
    });
  }

  /**
   * Returns select id string or undefined if list or list resource are not defined.
   * It is needed to enable/disable data select support (pagination, sorting) for particular list.
   *
   * @return {string}
   * @export
   */
  getSelectId() {
    const selectId = 'applicationgenericresources';

    if (
      this.applicationGenericResourceList !== undefined &&
      this.applicationGenericResourceListResource !== undefined
    ) {
      return selectId;
    }

    return '';
  }

  /**
   * @return {boolean}
   * @export
   */
  areMultipleNamespacesSelected() {
    return this.kdNamespaceService_.areMultipleNamespacesSelected();
  }
}

/**
 * @return {!angular.Component}
 */
export const ApplicationGenericResourceCardListComponent = {
  transclude: {
    // Optional header that is transcluded instead of the default one.
    header: '?kdHeader',
    // Optional zerostate content that is shown when there are zero items.
    zerostate: '?kdEmptyListText',
  },
  bindings: {
    applicationName: '<',
    groupName: '<',
    kindName: '<',
  },
  templateUrl: 'application/genericresourcelist/cardlist.html',
  controller: ApplicationGenericResourceCardListController,
};
