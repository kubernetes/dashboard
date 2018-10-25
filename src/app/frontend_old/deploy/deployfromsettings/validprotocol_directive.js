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
export const validProtocolValidationKey = 'validProtocol';

/**
 * Validates that chosen protocol is valid for chosen service type.
 *
 * @param {!angular.$resource} $resource
 * @param {!angular.$q} $q
 * @return {!angular.Directive}
 * @ngInject
 */
export default function validProtocolDirective($resource, $q) {
  const isExternalParam = 'isExternal';

  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      [isExternalParam]: '=',
    },
    link: function(scope, element, attrs, ctrl) {
      /** @type {!angular.NgModelController} */
      let ngModelController = ctrl;
      let externalChanged = false;

      scope.$watch(isExternalParam, (newVal, oldVal) => {
        externalChanged = newVal !== oldVal;
        ctrl.$validate();
      });

      ngModelController.$asyncValidators[validProtocolValidationKey] = (protocol) => {
        return validate(
            ngModelController, externalChanged, protocol, scope[isExternalParam], $resource, $q);
      };
    },
  };
}

/**
 * @param {!angular.NgModelController} ngModelController
 * @param {boolean} externalChanged
 * @param {string} protocol
 * @param {boolean} isExternal
 * @param {!angular.$resource} resource
 * @param {!angular.$q} q
 */
function validate(ngModelController, externalChanged, protocol, isExternal, resource, q) {
  let deferred = q.defer();

  // Avoid validation on page load when variables default values are set.
  if (!ngModelController.$touched && !externalChanged) {
    deferred.resolve();
    return deferred.promise;
  }

  /** @type {!angular.Resource} */
  let resourceClass = resource('api/v1/appdeployment/validate/protocol');
  /** @type {!backendApi.ProtocolValiditySpec} */
  let spec = {protocol: protocol, isExternal: isExternal};
  resourceClass.save(
      spec,
      /**
       * @param {!backendApi.ProtocolValidity} validity
       */
      (validity) => {
        if (validity.valid === true) {
          deferred.resolve();
        } else {
          deferred.reject();
        }
      },
      () => {
        deferred.reject();
      });

  return deferred.promise;
}
