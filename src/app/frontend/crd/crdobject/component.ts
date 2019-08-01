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

import {Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MatButtonToggleGroup} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {dump as toYaml} from 'js-yaml';
import {Subscription} from 'rxjs';
import {CRDObjectDetail} from '@api/backendapi';
import {highlightAuto} from 'highlight.js';
import {ActionbarService, ResourceMeta} from '../../common/services/global/actionbar';
import {NamespacedResourceService} from '../../common/services/resource/resource';
import {EndpointManager, Resource} from '../../common/services/resource/endpoint';
import {NotificationsService} from '../../common/services/global/notifications';
import {RawResource} from '../../common/resources/rawresource';

enum Modes {
  JSON = 'json',
  YAML = 'yaml',
}

@Component({selector: 'kd-crd-object-detail', templateUrl: './template.html'})
export class CRDObjectDetailComponent implements OnInit, OnDestroy {
  @ViewChild('group', {static: true}) buttonToggleGroup: MatButtonToggleGroup;
  @ViewChild('code', {static: true}) codeRef: ElementRef;

  private objectSubscription_: Subscription;
  private readonly endpoint_ = EndpointManager.resource(Resource.crd, true);
  object: CRDObjectDetail;
  modes = Modes;
  isInitialized = false;
  selectedMode = Modes.YAML;
  objectRaw: {[s: string]: string} = {};
  eventListEndpoint: string;

  constructor(
    private readonly object_: NamespacedResourceService<CRDObjectDetail>,
    private readonly actionbar_: ActionbarService,
    private readonly activatedRoute_: ActivatedRoute,
    private readonly notifications_: NotificationsService,
    private readonly http_: HttpClient,
    private readonly renderer_: Renderer2,
  ) {}

  ngOnInit(): void {
    const {crdName, namespace, objectName} = this.activatedRoute_.snapshot.params;
    this.eventListEndpoint = this.endpoint_.child(
      `${crdName}/${objectName}`,
      Resource.event,
      namespace,
    );

    this.objectSubscription_ = this.object_
      .get(this.endpoint_.child(crdName, objectName, namespace))
      .subscribe((d: CRDObjectDetail) => {
        this.object = d;
        this.notifications_.pushErrors(d.errors);
        this.actionbar_.onInit.emit(new ResourceMeta(d.typeMeta.kind, d.objectMeta, d.typeMeta));
        this.isInitialized = true;

        // Get raw resource
        const url = RawResource.getUrl(this.object.typeMeta, this.object.objectMeta);
        this.http_
          .get(url)
          .toPromise()
          .then(response => {
            this.objectRaw = {
              json: highlightAuto(`${this.toRawJSON(response)}`, ['json']).value,
              yaml: highlightAuto(`${toYaml(response)}`, ['yaml']).value,
            };
            this.updateText();
          });
      });

    this.buttonToggleGroup.valueChange.subscribe((selectedMode: Modes) => {
      this.selectedMode = selectedMode;

      if (Object.keys(this.objectRaw).length > 0) {
        this.updateText();
      }
    });
  }

  ngOnDestroy(): void {
    this.objectSubscription_.unsubscribe();
    this.actionbar_.onDetailsLeave.emit();
  }

  private updateText(): void {
    this.renderer_.setProperty(
      this.codeRef.nativeElement,
      'innerHTML',
      this.objectRaw[this.selectedMode],
    );
  }

  private toRawJSON(object: {}): string {
    return JSON.stringify(object, null, 2);
  }
}
