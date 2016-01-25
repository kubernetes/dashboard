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

/**
 * Controller for the port mappings directive.
 *
 * @final
 */
export default class PortMappingsController {
  /** @ngInject */
  constructor() {
    /**
     * Two way data binding from the scope.
     * @export {!Array<!backendApi.PortMapping>}
     */
    this.portMappings = [this.newEmptyPortMapping_(this.protocols[0])];

    /**
     * Initialized from the scope.
     * @export {!Array<string>}
     */
    this.protocols;

    /**
     * Initialized from the scope.
     * @export {boolean}
     */
    this.isExternal;
  }

  /**
   * @param {string} defaultProtocol
   * @return {!backendApi.PortMapping}
   * @private
   */
  newEmptyPortMapping_(defaultProtocol) {
    return {port: null, targetPort: null, protocol: defaultProtocol};
  }

  /**
   * @export
   */
  addProtocolIfNeeed() {
    let lastPortMapping = this.portMappings[this.portMappings.length - 1];
    if (this.isPortMappingFilled_(lastPortMapping)) {
      this.portMappings.push(this.newEmptyPortMapping_(this.protocols[0]));
    }
  }

  /**
   * @param {number} index
   * @return {boolean}
   * @export
   */
  isRemovable(index) { return index !== (this.portMappings.length - 1); }

  /**
   * @param {number} index
   * @export
   */
  remove(index) { this.portMappings.splice(index, 1); }

  /**
   * Returns true when the given port mapping is filled by the user, i.e., is not empty.
   * @param {!backendApi.PortMapping} portMapping
   * @return {boolean}
   * @private
   */
  isPortMappingFilled_(portMapping) { return !!portMapping.port && !!portMapping.targetPort; }
}
