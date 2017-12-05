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

/**
 * Controller for the environment variables directive.
 *
 * @final
 */
export class EnvironmentVariablesController {
  /** @ngInject */
  constructor() {
    /**
     * Two way data binding from the scope.
     * @export {!Array<!backendApi.EnvironmentVariable>}
     */
    this.variables;

    /**
     * Pattern that matches valid variable names. Like C identifier.
     * @const
     * @export {!RegExp}
     */
    this.namePattern;
  }

  /** @export */
  $onInit() {
    this.variables = [this.newVariable_()];
    this.namePattern = new RegExp('^[A-Za-z_][A-Za-z0-9_]*$');
  }

  /**
   * @return {!backendApi.EnvironmentVariable}
   * @private
   */
  newVariable_() {
    return {name: '', value: ''};
  }

  /**
   * @export
   */
  addVariableIfNeeed() {
    let last = this.variables[this.variables.length - 1];
    if (this.isVariableFilled_(last)) {
      this.variables.push(this.newVariable_());
    }
  }

  /**
   * @param {number} index
   * @return {boolean}
   * @export
   */
  isRemovable(index) {
    return index !== (this.variables.length - 1);
  }

  /**
   * @param {number} index
   * @export
   */
  remove(index) {
    this.variables.splice(index, 1);
  }

  /**
   * @param {!backendApi.EnvironmentVariable} variable
   * @return {boolean}
   * @private
   */
  isVariableFilled_(variable) {
    return !!variable.name;
  }
}

/**
 * Returns directive definition for the environment variables input widget.
 *
 * @return {!angular.Component}
 */
export const environmentVariablesComponent = {
  controller: EnvironmentVariablesController,
  controllerAs: 'ctrl',
  templateUrl: 'deploy/deployfromsettings/environmentvariables/environmentvariables.html',
  bindings: {
    'variables': '=',
  },
};
