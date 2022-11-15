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
import 'core-js/es/reflect';

// Required to support Web Animations `@angular/platform-browser/animations`:
import 'web-animations-js';

// Zone JS is required by default for Angular itself.
import 'zone.js/dist/zone';

// Load `$localize` onto the global scope - used if i18n tags appear in Angular templates.
import '@angular/localize/init';

// Global variable is required by some 3rd party libraries such as 'ace-ui'.
// It was removed in Angular 6.X, more info can be found here:
// https://github.com/angular/angular-cli/issues/9827#issuecomment-369578814
(window as any).global = window;
