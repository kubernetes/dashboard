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

import {IntegerType} from './integertype';

/**
 * @final
 */
export class TypeFactory {
  /**
   * @constructs TypeFactory
   */
  constructor() {
    /** @private {Map<Array<string, !./type.Type>>} */
    this.typeMap_ = new Map([
      ['integer', new IntegerType()],
    ]);
  }

  /**
   * Returns specific Type class based on given type name.
   *
   * @method
   * @param typeName
   * @returns {!./type.Type}
   */
  getType(typeName) {
    let typeObject = this.typeMap_.get(typeName);

    if (!typeObject) {
      throw new Error(`Given type '${typeName}' is not supported.`);
    }

    return typeObject;
  }
}
