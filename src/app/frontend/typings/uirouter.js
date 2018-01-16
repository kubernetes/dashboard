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
 * @fileoverview Externs for angular UI router that are missing from official ones.
 *
 * @externs
 */

const kdUiRouter = {};

/**
 * @constructor
 */
kdUiRouter.$stateProvider = function() {};

/**
 * @param {string} parent
 * @param {Function} callback
 */
kdUiRouter.$stateProvider.prototype.decorator = function(parent, callback) {};

/**
 * @constructor
 */
kdUiRouter.$transitions = function() {};

/**
 * @param {Object} criteria
 * @param {Function} callback
 * @param {Object=} options
 */
kdUiRouter.$transitions.prototype.onStart = function(criteria, callback, options) {};

/**
 * @param {Object} criteria
 * @param {Function} callback
 * @param {Object=} options
 */
kdUiRouter.$transitions.prototype.onBefore = function(criteria, callback, options) {};

/**
 * @param {Object} criteria
 * @param {Function} callback
 * @param {Object=} options
 */
kdUiRouter.$transitions.prototype.onError = function(criteria, callback, options) {};

/**
 * @param {Object} criteria
 * @param {Function} callback
 * @param {Object=} options
 */
kdUiRouter.$transitions.prototype.onSuccess = function(criteria, callback, options) {};

/**
 * @constructor
 */
kdUiRouter.$transition$ = function() {};

/**
 * @return {!ui.router.State}
 */
kdUiRouter.$transition$.prototype.to = function() {};

/**
 * @return {!ui.router.$stateParams}
 */
kdUiRouter.$transition$.prototype.params = function() {};

/**
 * @constructor
 */
kdUiRouter.$state = function() {};

/**
 * @param {Function} callback
 */
kdUiRouter.$state.prototype.defaultErrorHandler = function(callback) {};

/**
 * @param {string|!ui.router.State|!ui.router.$state} to
 * @param {?ui.router.StateParams=} opt_toParams
 * @param {!ui.router.StateOptions=} opt_options
 * @return {!angular.$q.Promise}
 */
kdUiRouter.$state.prototype.go = function(to, opt_toParams, opt_options) {};

/**
 * @param {string|!ui.router.State} to
 * @param {?ui.router.StateParams=} opt_toParams
 * @param {!ui.router.StateOptions=} opt_options
 * @return {!angular.$q.Promise}
 */
kdUiRouter.$state.prototype.target = function(to, opt_toParams, opt_options) {};

/** @type {!Object|undefined} */
kdUiRouter.$state.prototype.params;

/** @type {!kdUiRouter.$transition$} */
kdUiRouter.$state.prototype.transition;
