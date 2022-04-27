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

import {Component, Input} from '@angular/core';
import {Probe} from '@api/root.api';

@Component({
  selector: 'kd-probe-card',
  templateUrl: './template.html',
})
export class ProbeComponent {
  @Input() initialized: boolean;
  @Input() probe: Probe;

  get healthcheckUri(): string {
    if (!this.probe || !this.probe.httpGet || !this.probe.httpGet.scheme) {
      return '';
    }

    const host = this.probe.httpGet.host || '[host]';
    let uri = `${this.probe.httpGet.scheme.toLocaleLowerCase()}://${host}`;

    if (this.probe.httpGet.port) {
      uri += `:${this.probe.httpGet.port}`;
    }

    if (this.probe.httpGet.path) {
      uri += this.probe.httpGet.path;
    }

    return uri;
  }

  get tcpSocketAddr(): string {
    if (!this.probe || !this.probe.tcpSocket) {
      return '';
    }

    let addr = this.probe.tcpSocket.host || '[host]';
    if (this.probe.tcpSocket.port) {
      addr += `:${this.probe.tcpSocket.port}`;
    }

    return addr;
  }
}
