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
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 */

// IE10 and IE11 requires the following for the Reflect API.
import 'core-js/es7/reflect';

import 'hammerjs';

// Required to support Web Animations `@angular/platform-browser/animations`:
import 'web-animations-js';

// Zone JS is required by default for Angular itself.
import 'zone.js/dist/zone';

// RxJS is required to support additional Observable methods such as map or switchMap.
import 'rxjs/Rx';

// Needed for unit testing.
import 'core-js/es7/reflect';
