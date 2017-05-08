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

import {DataSelectQueryBuilder, ItemsPerPage, SortableProperties} from 'common/dataselect/builder';

describe('Data select query builder', () => {
  /** @type {!DataSelectQueryBuilder} */
  let builder;

  beforeEach(() => {
    builder = new DataSelectQueryBuilder();
  });

  it('should build query with default values', () => {
    // given
    let expectedQuery = {
      itemsPerPage: ItemsPerPage,
      page: 1,
      sortBy: `d,${SortableProperties.AGE}`,
      namespace: '',
      name: '',
      filterBy: '',
    };

    // when
    let query = builder.build();

    // then
    expect(query).toEqual(expectedQuery);
  });

  it('should build custom query', () => {
    // given
    let expectedQuery = {
      itemsPerPage: 5,
      page: 2,
      sortBy: `d,${SortableProperties.NAME}`,
      namespace: 'test-ns',
      name: 'test-name',
      filterBy: '',
    };

    // when
    let query = builder.setItemsPerPage(5)
                    .setPage(2)
                    .setSortBy(SortableProperties.NAME)
                    .setAscending(false)
                    .setNamespace('test-ns')
                    .setName('test-name')
                    .build();

    // then
    expect(query).toEqual(expectedQuery);
  });
});
