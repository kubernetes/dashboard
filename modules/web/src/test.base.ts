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

// Load `$localize` onto the global scope - used if i18n tags appear in Angular templates.
import '@angular/localize/init';

import 'jest-preset-angular/setup-jest';
import './test.base.mocks';

// eslint-disable-next-line node/no-extraneous-import
import {jest} from '@jest/globals';

// Async operations timeout
const timeout = 15000;
jest.setTimeout(timeout);

// Polyfill text encoder and decoder ot fix tests
import {TextEncoder, TextDecoder} from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
