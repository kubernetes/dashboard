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

import module from 'common/appconfig/module';
import {AppConfigService} from 'common/appconfig/service';

describe('Appconfig service test', () => {
  it(`increment time when getting server time`, () => {
    angular.mock.module(module.name);

    /**
     * Current time mock.
     * @type {Date}
     */
    const currentTime = new Date(
        2015,  // year
        11,    // month
        29,    // day
        20,    // hour
        30,    // minute
        40     // second
    );
    jasmine.clock().mockDate(currentTime);
    /** @type {!common/appconfig/service.AppConfigService} */
    let kdAppConfigService = new AppConfigService({serverTime: 1234567890123});

    expect(kdAppConfigService.getServerTime().getTime()).toBe(1234567890123);

    currentTime.setSeconds(20);
    jasmine.clock().mockDate(currentTime);

    expect(kdAppConfigService.getServerTime().getTime()).toBe(1234567890123 - 20 * 1000);
  });
});
