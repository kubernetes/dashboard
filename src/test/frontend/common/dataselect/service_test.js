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

import componentsModule from 'common/components/module';
import {SortableProperties} from 'common/dataselect/builder';
import {ALL_NAMESPACES} from 'common/namespace/component';
import settingsServiceModule from 'common/settings/module';


describe('Data Select service ', () => {
  /** @type {!DataSelectService} */
  let service;
  /** @type {number} */
  let itemsPerPage = 10;

  beforeEach(() => {
    angular.mock.module(componentsModule.name);
    angular.mock.module(settingsServiceModule.name);

    angular.mock.inject((_kdDataSelectService_, _kdSettingsService_) => {
      service = _kdDataSelectService_;
      itemsPerPage = _kdSettingsService_.getItemsPerPage();
    });
  });

  it('should initialize service', () => {
    expect(service).toBeDefined();
  });

  it('should register select id and return true', () => {
    // given
    let selectId = 'test';
    service.registerInstance(selectId);

    // when
    let result = service.isRegistered(selectId);

    // then
    expect(result).toBeTruthy();
  });

  it('should return false when given select id is not registered', () => {
    // given
    let selectId = 'test';

    // when
    let result = service.isRegistered(selectId);

    // then
    expect(result).toBeFalsy();
  });

  it('should return default resource query', () => {
    // given
    let namespace = 'test-ns';
    let name = 'test-name';
    let expected = {
      itemsPerPage: itemsPerPage,
      page: 1,
      sortBy: `d,${SortableProperties.AGE}`,
      namespace: namespace,
      name: name,
      filterBy: '',
    };

    // when
    let result = service.getDefaultResourceQuery(namespace, name);

    // then
    expect(result).toEqual(expected);
  });

  it('should return query with empty namespace when all namespaces are selected', () => {
    // given
    let namespace = ALL_NAMESPACES;
    let name = 'test-name';
    let expected = {
      itemsPerPage: itemsPerPage,
      page: 1,
      sortBy: `d,${SortableProperties.AGE}`,
      namespace: '',
      name: name,
      filterBy: '',
    };

    // when
    let result = service.getDefaultResourceQuery(namespace, name);

    // then
    expect(result).toEqual(expected);
  });
});
