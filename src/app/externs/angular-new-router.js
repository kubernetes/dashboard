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
 * @fileoverview Externs for Angular router: https://github.com/angular/router
 *
 * TODO(bryk): Move the externs out of this project.
 */


/** @const */
var ngNewRouter = {};


/**
 * @typedef {{
 *   setTemplateMapping: function(function(string):string)
 * }}
 */
ngNewRouter.$componentLoaderProvider = {};


/**
 * @typedef {{
 *   config: function(!Array<{path: string, component: string}>)
 * }}
 */
ngNewRouter.$router = {};
