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
 * Controller for the exec into pod view.
 *
 * @final
 */
export class PodExecController {
  /**
   * @ngInject
   */
  constructor($sce, $document, $resource, $stateParams, $state) {
    /** @private {!angular.$sce} */
    this.sce_ = $sce;

    /** @private {!HTMLDocument} */
    this.document_ = $document[0];

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!./podexec_state.StateParams} $stateParams */
    this.stateParams_ = $stateParams;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @export */
    this.i18n = i18n;

    // TODO: How to declare Terminal for the closure compiler?
    /** @export */
    this.term = new Terminal();
  }

  /**
   * Opens the terminal and attaches it to the DOM.
   * @export
   */
  loadTerminal() {
    // TODO: Is there a better way to get the element to attach the terminal to?
    this.term.open(this.document_.getElementById('kd-podexec-terminal'));

    let namespace = this.stateParams_.objectNamespace;
    let podId = this.stateParams_.objectName;
    let container = this.stateParams_.container || '';

    let socket = new WebSocket(`ws://${location.host}/api/v1/pod/${namespace}/${podId}/exec/${container}`.replace(/\/+$/, ""));

    let self = this;
    socket.onopen = function(event) {
      console.log(self.term);
      self.term.attach(socket);
    };

    socket.onclose = function(event) {
      console.log(event);
    }
    socket.onerror = function(event) {
      console.log(event);
    }
  }
}

const i18n = {};
