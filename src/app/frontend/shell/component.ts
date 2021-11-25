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

import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {PodContainerList, ShellFrame, SJSCloseEvent, SJSMessageEvent, TerminalResponse} from '@api/root.api';
import {debounce} from 'lodash';
import {ReplaySubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';

import {EndpointManager, Resource, Utility} from '@common/services/resource/endpoint';
import {NamespacedResourceService} from '@common/services/resource/resource';
import {UtilityService} from '@common/services/resource/utility';

declare let SockJS: any;

@Component({
  selector: 'kd-shell',
  templateUrl: './template.html',
  styleUrls: ['./styles.scss'],
})
export class ShellComponent implements AfterViewInit, OnDestroy {
  @ViewChild('anchor', {static: true}) anchorRef: ElementRef;
  term: Terminal;
  podName: string;
  selectedContainer: string;
  containers: string[];

  private readonly namespace_: string;
  private connecting_: boolean;
  private connectionClosed_: boolean;
  private conn_: WebSocket;
  private connected_ = false;
  private debouncedFit_: Function;
  private connSubject_ = new ReplaySubject<ShellFrame>(100);
  private incommingMessage$_ = new Subject<ShellFrame>();
  private readonly endpoint_ = EndpointManager.resource(Resource.pod, true);
  private readonly unsubscribe_ = new Subject<void>();
  private readonly keyEvent$_ = new ReplaySubject<KeyboardEvent>(2);

  constructor(
    private readonly containers_: NamespacedResourceService<PodContainerList>,
    private readonly utility_: UtilityService<TerminalResponse>,
    private readonly activatedRoute_: ActivatedRoute,
    private readonly matSnackBar_: MatSnackBar,
    private readonly cdr_: ChangeDetectorRef,
    private readonly _router: Router
  ) {
    this.namespace_ = this.activatedRoute_.snapshot.params.resourceNamespace;
    this.podName = this.activatedRoute_.snapshot.params.resourceName;

    const containersEndpoint = this.endpoint_.child(this.podName, Resource.container, this.namespace_);
    this.containers_
      .get(containersEndpoint)
      .pipe(takeUntil(this.unsubscribe_))
      .subscribe(containerList => {
        this.containers = containerList.containers;
        if (this.containers.length > 0 && !this.selectedContainer) {
          this.onPodContainerChange(this.containers[0]);
        }
      });
  }

  ngAfterViewInit(): void {
    this.activatedRoute_.paramMap.pipe(takeUntil(this.unsubscribe_)).subscribe(paramMap => {
      const container = paramMap.get('containerName');

      if (this.conn_ && this.connected_) {
        this.disconnect();
      }

      if (container) {
        this.selectedContainer = container;
        this.setupConnection();
        this.initTerm();
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe_.next();
    this.unsubscribe_.complete();

    if (this.conn_) {
      this.conn_.close();
    }

    if (this.connSubject_) {
      this.connSubject_.complete();
    }

    if (this.term) {
      this.term.dispose();
    }

    this.incommingMessage$_.complete();
  }

  onPodContainerChange(podContainer: string): void {
    this._router.navigate([`/shell/${this.namespace_}/${this.podName}/${podContainer}`], {
      queryParamsHandling: 'preserve',
    });
  }

  disconnect(): void {
    if (this.conn_) {
      this.conn_.close();
    }

    if (this.connSubject_) {
      this.connSubject_.complete();
      this.connSubject_ = new ReplaySubject<ShellFrame>(100);
    }

    if (this.term) {
      this.term.dispose();
    }

    this.incommingMessage$_.complete();
    this.incommingMessage$_ = new Subject<ShellFrame>();
  }

  initTerm(): void {
    if (this.connSubject_) {
      this.connSubject_.complete();
      this.connSubject_ = new ReplaySubject<ShellFrame>(100);
    }

    if (this.term) {
      this.term.dispose();
    }

    this.term = new Terminal({
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      bellStyle: 'sound',
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    this.term.loadAddon(fitAddon);
    this.term.open(this.anchorRef.nativeElement);
    this.debouncedFit_ = debounce(() => {
      fitAddon.fit();
      this.cdr_.markForCheck();
    }, 100);
    this.debouncedFit_();
    window.addEventListener('resize', () => this.debouncedFit_());

    this.connSubject_.pipe(takeUntil(this.unsubscribe_)).subscribe(frame => {
      this.handleConnectionMessage(frame);
    });

    this.term.onData(this.onTerminalSendString.bind(this));
    this.term.onResize(this.onTerminalResize.bind(this));
    this.term.onKey(event => {
      this.keyEvent$_.next(event.domEvent);
    });

    this.cdr_.markForCheck();
  }

  private async setupConnection(): Promise<void> {
    if (!(this.selectedContainer && this.podName && this.namespace_ && !this.connecting_)) {
      return;
    }

    this.connecting_ = true;
    this.connectionClosed_ = false;

    const terminalSessionUrl = `${EndpointManager.utility(Utility.shell).shell(this.namespace_, this.podName)}/${
      this.selectedContainer
    }`;
    const {id} = await this.utility_.shell(terminalSessionUrl).toPromise();

    this.conn_ = new SockJS(`api/sockjs?${id}`);
    this.conn_.onopen = this.onConnectionOpen.bind(this, id);
    this.conn_.onmessage = this.onConnectionMessage.bind(this);
    this.conn_.onclose = this.onConnectionClose.bind(this);

    this.cdr_.markForCheck();
  }

  private onConnectionOpen(sessionId: string): void {
    const startData = {Op: 'bind', SessionID: sessionId};
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
      this.matSnackBar_.open(frame.Data, null, {duration: 3000});
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
    this.matSnackBar_.open(_evt.reason, null, {duration: 3000});

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
