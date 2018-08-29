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

import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {PodContainerList, ShellFrame, SJSCloseEvent, SJSMessageEvent, TerminalResponse} from '@api/backendapi';
import {StateService} from '@uirouter/core';
import {debounce} from 'lodash';
import {Observable, ReplaySubject, Subject, Subscription} from 'rxjs';
import {filter, first, map, share, startWith, tap} from 'rxjs/operators';
import {Terminal} from 'xterm';
import {fit} from 'xterm/lib/addons/fit/fit';
import {ExecStateParams} from '../common/params/params';
import {EndpointManager, Resource} from '../common/services/resource/endpoint';
import {NamespacedResourceService} from '../common/services/resource/resource';
// tslint:disable-next-line:no-any
declare let SockJS: any;

@Component({selector: 'kd-shell', templateUrl: './template.html', styleUrls: ['./styles.scss']})
export class ShellComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('anchor') anchorRef: ElementRef;
  term: Terminal;

  namespace: string;
  podName: string;
  containerName: string;
  podContainers$: Observable<string[]>;

  connecting: boolean;
  connectionClosed: boolean;

  private readonly keyEvent$ = new ReplaySubject<KeyboardEvent>(2);
  private conn: WebSocket;
  private readonly connSubject = new ReplaySubject<ShellFrame>(100);
  private connSub: Subscription;
  private connected = false;
  private debouncedFit: Function;
  private readonly incommingMessage$ = new Subject<ShellFrame>();

  constructor(
      private readonly podContainer_: NamespacedResourceService<PodContainerList>,
      private readonly terminal_: NamespacedResourceService<TerminalResponse>,
      private readonly state_: StateService, private readonly matSnackBar_: MatSnackBar,
      private readonly cdr_: ChangeDetectorRef) {}

  onPodContainerChange(podContainer: string): void {
    this.containerName = podContainer;
    this.state_.go(
        '.', new ExecStateParams(this.namespace, this.podName, podContainer), {reload: true});
  }

  ngOnInit(): void {
    const {resourceNamespace, resourceName, containerName} = this.state_.params;
    this.namespace = resourceNamespace;
    this.podName = resourceName;
    this.containerName = containerName;

    const containersEndpoint =
        EndpointManager.resource(Resource.pod, true).child(resourceName, Resource.container);

    this.podContainers$ =
        this.podContainer_.get(containersEndpoint)
            .pipe(
                startWith({containers: []}), map(({containers}) => containers), share(),
                filter(containers => containers && containers.length > 0), first(),
                tap(containers => {
                  if (!this.containerName) {
                    this.containerName = containers[0];
                  }
                  this.setupConnection();
                }));
  }

  ngAfterViewInit(): void {
    this.term = new Terminal({
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      bellStyle: 'sound',
      cursorBlink: true
    });

    this.term.open(this.anchorRef.nativeElement);
    this.debouncedFit = debounce(() => {
      fit(this.term);
      this.cdr_.markForCheck();
    }, 100);
    this.debouncedFit();
    window.addEventListener('resize', () => this.debouncedFit());

    this.connSub = this.connSubject.subscribe(frame => {
      this.handleConnectionMessage(frame);
    });

    this.term.on('data', this.onTerminalSendString.bind(this));
    this.term.on('resize', this.onTerminalResize.bind(this));
    this.term.on('key', (_, event) => {
      this.keyEvent$.next(event);
    });

    this.cdr_.markForCheck();
  }

  ngOnDestroy(): void {
    if (this.conn && this.connected) {
      this.conn.close();
    }

    if (this.connSubject) {
      this.connSubject.complete();
    }

    if (this.connSub) {
      this.connSub.unsubscribe();
    }

    if (this.term) {
      this.term.destroy();
    }

    this.incommingMessage$.complete();
  }

  private async setupConnection(): Promise<void> {
    if (!(this.containerName && this.podName && this.namespace && !this.connecting)) {
      return;
    }

    this.connecting = true;
    this.connectionClosed = false;

    const terminalSessionUrl =
        EndpointManager.resource(Resource.pod, true).child(this.podName, Resource.shell) + '/' +
        this.containerName;

    const {id} = await this.terminal_.get(terminalSessionUrl).toPromise();

    this.conn = new SockJS(`api/sockjs?${id}`);
    this.conn.onopen = this.onConnectionOpen.bind(this, id);
    this.conn.onmessage = this.onConnectionMessage.bind(this);
    this.conn.onclose = this.onConnectionClose.bind(this);

    this.cdr_.markForCheck();
  }

  private onConnectionOpen(sessionId: string): void {
    const startData = {Op: 'bind', SessionID: sessionId};
    this.conn.send(JSON.stringify(startData));
    this.connSubject.next(startData);
    this.connected = true;
    this.connecting = false;
    this.connectionClosed = false;

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
      this.matSnackBar_.open(frame.Data, null, {duration: 3000});
    }

    this.incommingMessage$.next(frame);
    this.cdr_.markForCheck();
  }

  private onConnectionMessage(evt: SJSMessageEvent): void {
    const msg = JSON.parse(evt.data);
    this.connSubject.next(msg);
  }

  private onConnectionClose(_evt?: SJSCloseEvent): void {
    if (!this.connected) {
      return;
    }
    this.conn.close();
    this.connected = false;
    this.connecting = false;
    this.connectionClosed = true;
    this.matSnackBar_.open(_evt.reason, null, {duration: 3000});

    this.cdr_.markForCheck();
  }

  private onTerminalSendString(str: string): void {
    if (this.connected) {
      this.conn.send(
          JSON.stringify({Op: 'stdin', Data: str, Cols: this.term.cols, Rows: this.term.rows}));
    }
  }

  private onTerminalResize(): void {
    if (this.connected) {
      this.conn.send(JSON.stringify({Op: 'resize', Cols: this.term.cols, Rows: this.term.rows}));
    }
  }
}
