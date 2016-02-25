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

import computeTextLength from 'common/components/middleellipsis/middleellipsis';
import componentsModule from 'common/components/components_module';

describe('Middle ellipsis', () => {
  /** @type {!angular.Scope} */
  let scope;
  /** @type {!angular.$compile} */
  let compile;
  /** @type {!angular.$filter} */
  let filter;

  /**
   * Creates fixture html element mock for the tests. If given string is 1 char wide then final
   * string length will be extended by given text length number, otherwise given string will be
   * used.
   *
   * @param {number} availableWidth
   * @param {string} str
   * @param {number} textLength
   *
   * @return {!angular.JQLite}
   */
  function getFixtureElement(availableWidth, str, textLength) {
    let displayText;
    if (str.length === 1) {
      displayText = new Array(textLength + 1).join(str);
    } else {
      displayText = str;
    }

    return angular.element(`
    <div style="width: ${availableWidth}px; display: block;" id="fixture">
      <div style="width: 100%; display: block;" class="kd-middleellipsis-container">
        <span class="kd-middleellipsis">${displayText}</span>
      </div>
    </div>`);
  }

  beforeEach(() => {
    angular.mock.module(componentsModule.name);

    angular.mock.inject(($compile, $rootScope, middleEllipsisFilter) => {
      scope = $rootScope.$new();
      compile = $compile;
      filter = middleEllipsisFilter;
    });
  });

  it('should compute optimal text length', () => {
    // given

    /**
     * Test object contains:
     *  - element - fixture element that contains kd-middleellipsis-container and
     *  kd-middleellipsis elements.
     *  - filterFn - filter function used to truncate string
     *  - expected - expected length calculated by computeTextLength function
     */
    let testData = [
      // One 'x' char takes approx. 8px. When result length is 0 string also won't be truncated.
      // It's important to remember that '...' also take some space. One '.' take approx. 4px.
      [getFixtureElement(0, 'x', 1), filter, 0],
      [getFixtureElement(8, 'x', 1), filter, 1],

      [getFixtureElement(14, 'x', 2), filter, 0],
      [getFixtureElement(16, 'x', 2), filter, 2],

      [getFixtureElement(22, 'x', 3), filter, 1],
      [getFixtureElement(24, 'x', 3), filter, 3],

      [getFixtureElement(24, 'x', 4), filter, 1],
      [getFixtureElement(30, 'x', 4), filter, 2],
      [getFixtureElement(32, 'x', 4), filter, 4],

      [getFixtureElement(26, 'x', 33), filter, 1],
      [getFixtureElement(30, 'x', 33), filter, 2],

      [getFixtureElement(323, 'x', 66), filter, 38],
      [getFixtureElement(324, 'x', 57), filter, 39],

      [getFixtureElement(555, 'dashboard', 0), filter, 9],
      [getFixtureElement(20, 'dashboard', 0), filter, 1],
    ];

    testData.forEach((testData) => {
      // given
      let [fixture, filter, expected] = testData;

      fixture = compile(fixture)(scope);
      angular.element('body').append(fixture);

      let container = fixture.find('.kd-middleellipsis-container')[0];
      let element = fixture.find('.kd-middleellipsis')[0];
      let displayText = element.textContent;

      // when
      let actual = computeTextLength(container, element, filter, displayText);

      // then
      expect(actual).toBe(
          expected,
          `Expected length to be ${expected} but was ${actual} ` + `for text: ${displayText}`);

      // Clean up
      fixture.remove();
    });
  });
});
