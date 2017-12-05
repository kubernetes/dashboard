// Copyright 2017 The Kubernetes Authors.
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

/** The name of this directive. */
export const uniqueNameValidationKey = 'uniqueName';

/**
 * Validates that application name is unique within the given namespace.
 *
 * @param {!angular.$resource} $resource
 * @param {!angular.$q} $q
 * @return {!angular.Directive}
 * @ngInject
 */
export default function uniqueNameDirective($resource, $q) {
  const namespaceParam = 'namespace';

  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      [namespaceParam]: '=',
    },
    link: function(scope, element, attrs, ctrl) {
      /** @type {!angular.NgModelController} */
      let ngModelController = ctrl;

      scope.$watch(namespaceParam, () => {
        ctrl.$validate();
      });
      ngModelController.$asyncValidators[uniqueNameValidationKey] = (name) => {
        return validate(name, scope[namespaceParam], $resource, $q);
      };
    },
  };
}

/**
 * @param {string} name
 * @param {string} namespace
 * @param {!angular.$resource} resource
 * @param {!angular.$q} q
 */
function validate(name, namespace, resource, q) {
  let deferred = q.defer();

  /** @type {!angular.Resource} */
  let resourceClass = resource('api/v1/appdeployment/validate/name');
  /** @type {!backendApi.AppNameValiditySpec} */
  let spec = {name: name, namespace: namespace};
  resourceClass.save(
      spec,
      /**
       * @param {!backendApi.AppNameValidity} validity
       */
      (validity) => {
        if (validity.valid === true) {
          deferred.resolve();
        } else {
          deferred.reject();
        }
      },
      () => {
        // On error assume that the name is valid. If it is not, the error is caught
        // later in the deploy pipeline.
        deferred.resolve();
      });

  return deferred.promise;
}
