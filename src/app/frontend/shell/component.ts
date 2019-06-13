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

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import {
  PodContainerList,
  ShellFrame,
  SJSCloseEvent,
  SJSMessageEvent,
  TerminalResponse,
} from '@api/backendapi';
import { debounce } from 'lodash';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { Terminal } from 'xterm';
import { fit } from 'xterm/lib/addons/fit/fit';

import {
  EndpointManager,
  Resource,
} from '../common/services/resource/endpoint';
import { NamespacedResourceService } from '../common/services/resource/resource';

// tslint:disable-next-line:no-any
declare let SockJS: any;

@Component({
  selector: 'kd-shell',
  templateUrl: './template.html',
  styleUrls: ['./styles.scss'],
})
export class ShellComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('anchor', { static: true }) anchorRef: ElementRef;
  term: Terminal;
  podName: string;
  selectedContainer: string;
  containers: string[];

  private namespace_: string;
  private connecting_: boolean;
  private connectionClosed_: boolean;
  private conn_: WebSocket;
  private connected_ = false;
  private debouncedFit_: Function;
  private readonly endpoint_ = EndpointManager.resource(Resource.pod, true);
  private readonly subscriptions_: Subscription[] = [];
  private readonly keyEvent$_ = new ReplaySubject<KeyboardEvent>(2);
  private readonly connSubject_ = new ReplaySubject<ShellFrame>(100);
  private readonly incommingMessage$_ = new Subject<ShellFrame>();

  constructor(
    private readonly containers_: NamespacedResourceService<PodContainerList>,
    private readonly terminal_: NamespacedResourceService<TerminalResponse>,
    private readonly activatedRoute_: ActivatedRoute,
    private readonly matSnackBar_: MatSnackBar,
    private readonly cdr_: ChangeDetectorRef
  ) {}

  onPodContainerChange(podContainer: string): void {
    this.selectedContainer = podContainer;
  }

  ngOnInit(): void {
    this.namespace_ = this.activatedRoute_.snapshot.params.resourceNamespace;
    this.podName = this.activatedRoute_.snapshot.params.resourceName;
    this.selectedContainer = this.activatedRoute_.snapshot.params.containerName;

    const containersEndpoint = this.endpoint_.child(
      this.podName,
      Resource.container,
      this.namespace_
    );

    this.containers_.get(containersEndpoint).subscribe(containerList => {
      this.containers = containerList.containers;
      if (this.containers.length > 0 && !this.selectedContainer) {
        this.selectedContainer = this.containers[0];
      }

      this.setupConnection();
    });
  }

  ngAfterViewInit(): void {
    this.term = new Terminal({
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      bellStyle: 'sound',
      cursorBlink: true,
    });

    this.term.open(this.anchorRef.nativeElement);
    this.debouncedFit_ = debounce(() => {
      fit(this.term);
      this.cdr_.markForCheck();
    }, 100);
    this.debouncedFit_();
    window.addEventListener('resize', () => this.debouncedFit_());

    this.subscriptions_.push(
      this.connSubject_.subscribe(frame => {
        this.handleConnectionMessage(frame);
      })
    );

    this.term.on('data', this.onTerminalSendString.bind(this));
    this.term.on('resize', this.onTerminalResize.bind(this));
    this.term.on('key', (_, event) => {
      this.keyEvent$_.next(event);
    });

    this.cdr_.markForCheck();
  }

  ngOnDestroy(): void {
    if (this.conn_ && this.connected_) {
      this.conn_.close();
    }

    if (this.connSubject_) {
      this.connSubject_.complete();
    }

    if (this.subscriptions_.length > 0) {
      for (const sub of this.subscriptions_) {
        sub.unsubscribe();
      }
    }

    if (this.term) {
      this.term.dispose();
    }

    this.incommingMessage$_.complete();
  }

  private async setupConnection(): Promise<void> {
    if (
      !(
        this.selectedContainer &&
        this.podName &&
        this.namespace_ &&
        !this.connecting_
      )
    ) {
      return;
    }

    this.connecting_ = true;
    this.connectionClosed_ = false;

    const terminalSessionUrl =
      this.endpoint_.child(this.podName, Resource.shell, this.namespace_) +
      '/' +
      this.selectedContainer;
    const { id } = await this.terminal_.get(terminalSessionUrl).toPromise();

    this.conn_ = new SockJS(`/api/sockjs?${id}`);
    this.conn_.onopen = this.onConnectionOpen.bind(this, id);
    this.conn_.onmessage = this.onConnectionMessage.bind(this);
    this.conn_.onclose = this.onConnectionClose.bind(this);

    this.cdr_.markForCheck();
  }

  private onConnectionOpen(sessionId: string): void {
    const startData = { Op: 'bind', SessionID: sessionId };
    this.conn_.send(JSON.stringify(startData));
    this.connSubject_.next(startData);
    this.connected_ = true;
    this.connecting_ = false;
    this.connectionClosed_ = false;

    // Make sure the terminal is with correct display size.
    this.onTerminalResize();

    // Focus on connection
    this.term.focus();
    this.cdr_.markForCheck();
  }

  private handleConnectionMessage(frame: ShellFrame): void {
    if (frame.Op === 'stdout') {
      this.term.write(frame.Data);
    }

    if (frame.Op === 'toast') {
      this.matSnackBar_.open(frame.Data, null, { duration: 3000 });
    }

    this.incommingMessage$_.next(frame);
    this.cdr_.markForCheck();
  }

  private onConnectionMessage(evt: SJSMessageEvent): void {
    const msg = JSON.parse(evt.data);
    this.connSubject_.next(msg);
  }

  private onConnectionClose(_evt?: SJSCloseEvent): void {
    if (!this.connected_) {
      return;
    }
    this.conn_.close();
    this.connected_ = false;
    this.connecting_ = false;
    this.connectionClosed_ = true;
    this.matSnackBar_.open(_evt.reason, null, { duration: 3000 });

    this.cdr_.markForCheck();
  }

  private onTerminalSendString(str: string): void {
    if (this.connected_) {
      this.conn_.send(
        JSON.stringify({
          Op: 'stdin',
          Data: str,
          Cols: this.term.cols,
          Rows: this.term.rows,
        })
      );
    }
  }

  private onTerminalResize(): void {
    if (this.connected_) {
      this.conn_.send(
        JSON.stringify({
          Op: 'resize',
          Cols: this.term.cols,
          Rows: this.term.rows,
        })
      );
    }
  }
}
