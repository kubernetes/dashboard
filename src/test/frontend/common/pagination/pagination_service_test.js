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

import paginationModule from 'common/pagination/pagination_module';
import {DEFAULT_ROWS_LIMIT, ROWS_LIMIT_OPTIONS} from 'common/pagination/pagination_service';

describe('Pagination service', () => {
  /** @type {!common/pagination/pagination_service.PaginationService} */
  let paginationService;
  /** @type {string} */
  let paginationId;

  beforeEach(() => angular.mock.module(paginationModule.name));

  beforeEach(angular.mock.inject((kdPaginationService) => {
    paginationId = 'test-id';
    paginationService = kdPaginationService;
    paginationService.registerInstance(paginationId);
  }));

  it('should return rows limit', () => {
    // when
    let rowsLimit = paginationService.getRowsLimit(paginationId);

    // then
    expect(rowsLimit).toEqual(DEFAULT_ROWS_LIMIT);
  });

  it('should throw an error on get rows limit', () => {
    // given
    let wrongPaginationId = 'wrong-id';

    // then
    expect(() => {
      paginationService.getRowsLimit(wrongPaginationId);
    })
        .toThrow(new Error(
            `Pagination limit for given pagination id ${wrongPaginationId} does not exist`));
  });

  it('should register and recognize registered pagination id', () => {
    // given
    let paginationId = 'some-id';

    // when
    paginationService.registerInstance(paginationId);
    let result = paginationService.isRegistered(paginationId);

    // then
    expect(result).toBeTruthy();
  });

  it('should not recognize not registered pagination id', () => {
    // when
    let result = paginationService.isRegistered('some-id');

    // then
    expect(result).toBeFalsy();
  });

  it('should set rows limit for given pagination id', () => {
    // given
    let rowsLimit = 10;

    // when
    paginationService.setRowsLimit(rowsLimit, paginationId);
    let result = paginationService.getRowsLimit(paginationId);

    // then
    expect(result).toEqual(rowsLimit);
  });

  it('should throw an error on set rows limit', () => {
    // given
    let wrongRowsLimit = 5;
    let notExistingId = 'some-id';
    let rowsLimit = 10;

    // then
    expect(() => {
      paginationService.setRowsLimit(wrongRowsLimit, paginationId);
    }).toThrow(new Error(`Limit has to be in range ${ROWS_LIMIT_OPTIONS}`));

    expect(() => {
      paginationService.setRowsLimit(rowsLimit, notExistingId);
    })
        .toThrow(
            new Error(`Pagination limit for given pagination id ${notExistingId} does not exist`));
  });

  it('should return min rows limit', () => {
    expect(paginationService.getMinRowsLimit()).toEqual(ROWS_LIMIT_OPTIONS[0]);
  });

  it('should return rows limit options', () => {
    expect(paginationService.getRowsLimitOptions()).toEqual(ROWS_LIMIT_OPTIONS);
  });

  it('should reset rows limit', () => {
    // given
    paginationService.registerInstance('id-1');
    paginationService.registerInstance('id-2');

    paginationService.setRowsLimit(50, 'id-1');
    paginationService.setRowsLimit(100, 'id-2');

    // when
    paginationService.resetRowsLimit();

    // then
    expect(paginationService.getRowsLimit('id-1')).toEqual(DEFAULT_ROWS_LIMIT);
    expect(paginationService.getRowsLimit('id-2')).toEqual(DEFAULT_ROWS_LIMIT);
  });

  it('should return pagination query object', () => {
    let cases = [
      [10, 1, 'ns-1', {itemsPerPage: 10, page: 1, namespace: 'ns-1', name: undefined}],
      [10, 1, '_all', {itemsPerPage: 10, page: 1, namespace: '', name: undefined}],
      [10, 2, undefined, {itemsPerPage: 10, page: 2, namespace: '', name: undefined}],
    ];

    cases.forEach((testData) => {
      // given
      let [itemsPerPage, page, ns, expected] = testData;

      // when
      let actual = paginationService.getResourceQuery(itemsPerPage, page, ns);

      // then
      expect(actual).toEqual(expected);
    });
  });

  it('should return default pagination query object', () => {
    let cases = [
      ['ns-1', {itemsPerPage: 10, page: 1, namespace: 'ns-1', name: undefined}],
      [undefined, {itemsPerPage: 10, page: 1, namespace: '', name: undefined}],
    ];

    cases.forEach((testData) => {
      // given
      let [ns, expected] = testData;

      // when
      let actual = paginationService.getDefaultResourceQuery(ns);

      // then
      expect(actual).toEqual(expected);
    });
  });
});
