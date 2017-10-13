// Copyright 2015 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Root configuration file of the Gulp build system. It loads child modules which
 * define specific Gulp tasks.
 *
 * Learn more at: http://gulpjs.com
 */
import './build/check';
import './build/ci';
import './build/backend';
import './build/build';
import './build/dependencies';
import './build/deploy';
import './build/index';
import './build/script';
import './build/serve';
import './build/style';
import './build/test';
import './build/i18n';

// No business logic in this file.
