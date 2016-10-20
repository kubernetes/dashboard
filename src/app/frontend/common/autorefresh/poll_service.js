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
 * Service class for polling.
 * @final
 */
export class PollService {
  /**
   * @param $interval {!angular.$interval}
   * @param $q {!angular.$q}
   * @ngInject
   */
  constructor($interval, $q) {
    /**
     * @type {!angular.$interval}
     * @private
     */
    this.intervalService_ = $interval;

    /**
     * @type {!angular.$q}
     * @private
     */
    this.q_ = $q;

    /**
     * @type {!Array<PollOptions>}
     * @private
     */
    this.optionsList_;
  }

  /**
   * Starts polling and returns polling promise.
   * @param resource {!angular.$resource}
   * @param params {angular.Resource.ParamsOrCallback=}
   * @param delay {number}
   * @export
   * @returns {!angular.$q.Promise}
   */
  poll(resource, params, delay) {
    this.optionsList_ = this.optionsList_ || new Array();
    let options = this.getOptionsByResource_(resource);
    if (!options) {
      options = new PollOptions(resource, params, delay);
      this.optionsList_.push(options);
    }
    // Stop if there is any previously running interval
    this.cancelInterval_(options);
    return this.createInterval_(options);
  }

  /**
   * Stops all running polls.
   * @export
   */
  stopAll() {
    this.optionsList_.map((options) => {
      this.cancelInterval_(options);
    });
  }

  /**
   * Stops all running polls and removes all registered options.
   * @export
   */
  removeAll() {
    this.stopAll();
    this.optionsList_ = new Array();
  }

  /**
   * Starts polling intervals for the all registered options.
   * @export
   */
  startAll() {
    this.stopAll();
    this.optionsList_.map((options) => {
      this.createInterval_(options);
    });
  }

  /**
   * Creates polling interval.
   * @param options {!PollOptions}
   * @returns {!angular.$q.Promise}
   * @private
   */
  createInterval_(options) {
    if (!options.deferred) {
      options.deferred = this.q_.defer();
    }

    options.interval = this.intervalService_(() => {
      let promise = options.pollResource.get(options.params).$promise;
      promise.then(
          (obj) => {
            options.deferred.notify(obj);
          },
          (err) => {
            options.deferred.reject(err);
            // Resource can't retrieve any record. It is not necessary to continue polling anymore.
            this.cancelInterval_(options);
            this.removeOptions_(options);

          });
    }, options.delay);

    return options.deferred.promise;
  }

  /**
   * Stops given poll service.
   * @param options {!PollOptions}
   * @private
   */
  cancelInterval_(options) {
    this.intervalService_.cancel(options.interval);
  }


  /**
   * Checks if the options already registered with the given resource.
   * @param resource {angular.Resource.ParamsOrCallback=}
   * @private
   * @returns {PollOptions}
   */
  getOptionsByResource_(resource) {
    if (!this.optionsList_.length) {
      return null;
    }
    let targetOptions = null;
    this.optionsList_.map((p) => {
      if (p.pollResource === resource) {
        targetOptions = p;
      }
    });
    return targetOptions;
  }

  /**
   * Removes given options object from the optionList
   * @param options {!PollOptions}
   * @private
   */
  removeOptions_(options) {
    this.optionsList_.map((p, i) => {
      if (p === options) {
        this.optionsList_.splice(i, 1);
      }
    });
  }
}

/** @type {number} */
export const DEFAULT_DELAY = 10000;

export class PollOptions {
  /**
   * @param resource {!angular.$resource}
   * @param params {angular.Resource.ParamsOrCallback=}
   * @param delay {number}
   */
  constructor(resource, params, delay) {
    /**
     * @type {number}
     * @export
     */
    this.delay = delay || DEFAULT_DELAY;

    /**
     * @type {angular.Resource.ParamsOrCallback}
     * @export
     */
    this.params = params;

    /**
     * @type {angular.$resource}
     * @export
     */
    this.pollResource = resource;

    /**
     * @type {!angular.$q.Promise}
     * @export
     */
    this.interval;

    /**
     * @type {!angular.$q.Deferred}
     * @export
     */
    this.deferred;
  }
}
