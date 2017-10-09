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
 * Parser to get TAG from reference of Docker container image
 *
 * Docker Container image can be set with the following value:
 *   [REGISTRY_HOST[:REGISTRY_PORT]/]NAME[:TAG]
 * REGISTRY can be omitted and NAME can contain '/' as delimiters for NAMESPACE.
 *
 */

export default class DockerImageReference {
  /**
   * Constructs DockerImageReference object.
   *
   * @param {string} reference
   */
  constructor(reference) {
    /**
     * @private {string}
     */
    this.reference_ = reference;
  }

  /**
   * Returns tag
   *
   * TAG cannot contain ':' and '/'.
   * If TAG is not omitted, last block text(separated by '/') contains TAG.
   * @return {string}
   */
  tag() {
    /** @type {number} **/
    let index = (this.reference_ || '').lastIndexOf('/');

    /** @type {string} **/
    let last_block = '';
    if (index > -1) {
      last_block = this.reference_.substring(index + 1);
    } else {
      last_block = this.reference_;
    }

    index = (last_block || '').lastIndexOf(':');
    if (index > -1) {
      return last_block.substring(index + 1);
    }
    return '';
  }
}
