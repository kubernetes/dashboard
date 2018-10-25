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
export const validImageReferenceValidationKey = 'validImageReference';

const invalidImageErrorMessage = 'invalidImageErrorMessage';

/**
 * Validates image reference
 *
 * @param {!angular.$resource} $resource
 * @param {!angular.$q} $q
 * @return {!angular.Directive}
 * @ngInject
 */
export default function validImageReferenceDirective($resource, $q) {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      [invalidImageErrorMessage]: '=',
    },
    link: function(scope, element, attrs, ctrl) {
      /** @type {!angular.NgModelController} */
      let ngModelController = ctrl;

      ngModelController.$asyncValidators[validImageReferenceValidationKey] = (reference) => {
        return validate(reference, scope, $resource, $q);
      };
    },
  };
}

/**
 * @param {string} reference
 * @param {!angular.$resource} resource
 * @param {!angular.$q} q
 */
function validate(reference, scope, resource, q) {
  let deferred = q.defer();

  /** @type {!angular.Resource} */
  let resourceClass = resource('api/v1/appdeployment/validate/imagereference');
  /** @type {!backendApi.ImageReferenceValiditySpec} */
  let spec = {reference: reference};

  resourceClass.save(
      spec,
      /**
       * @param {!backendApi.ImageReferenceValidity} validity
       */
      (validity) => {
        if (validity.valid === true) {
          scope[invalidImageErrorMessage] = '';
          deferred.resolve();
        } else {
          scope[invalidImageErrorMessage] = validity.reason;
          deferred.reject(scope[invalidImageErrorMessage]);
        }
      },
      (err) => {
        scope[invalidImageErrorMessage] = err.data;
        deferred.reject();
      });

  return deferred.promise;
}
