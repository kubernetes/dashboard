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

/**
 * AngularJS module for paginating (almost) anything.
 *
 * @fileoverview Externs for angularUtils pagination module that are missing from official ones.
 *
 * @externs
 */

const kdDirPagination = {};

/**
 * This provider allows global configuration of the template path used by the
 * dir-pagination-controls directive.
 * @constructor
 */
kdDirPagination.paginationTemplateProvider = function() {};

/**
 * Set a templateUrl to be used by all instances of <dir-pagination-controls>
 * @param {string} path
 */
kdDirPagination.paginationTemplateProvider.prototype.setPath = function(path) {};
